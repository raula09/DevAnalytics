#!/bin/bash
set -e

mkdir -p server/Models server/DTOs server/Services
echo "Creating backend (C# .NET) files..."

# Models
cat > server/Models/User.cs <<'CS'
namespace Server.Models;
public class User
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
CS

cat > server/Models/AnalyticsRecord.cs <<'CS'
namespace Server.Models;
public class AnalyticsRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = "unknown";
    public string Workspace { get; set; } = "default";
    public string LanguageId { get; set; } = "unknown";
    public int Seconds { get; set; } = 0;
    public int FilesOpened { get; set; } = 0;
    public int Keystrokes { get; set; } = 0;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
CS

# DTOs
cat > server/DTOs/AuthDtos.cs <<'CS'
namespace Server.DTOs;
public class RegisterRequest { public string Email { get; set; } = ""; public string Password { get; set; } = ""; }
public class LoginRequest { public string Email { get; set; } = ""; public string Password { get; set; } = ""; }
public class AuthResponse { public string Token { get; set; } = ""; public string Email { get; set; } = ""; }
CS

# Services
cat > server/Services/UserService.cs <<'CS'
using MongoDB.Driver;
using Server.Models;
using BCrypt.Net;

namespace Server.Services;
public class UserService
{
    private readonly IMongoCollection<User> _users;
    public UserService(IMongoClient client)
    {
        var db = client.GetDatabase("devanalytics");
        _users = db.GetCollection<User>("users");
        _users.Indexes.CreateOne(new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Ascending(u => u.Email),
            new CreateIndexOptions { Unique = true }
        ));
    }
    public async Task<User?> FindByEmailAsync(string email) => await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
    public async Task<User> CreateAsync(string email, string password)
    {
        var existing = await FindByEmailAsync(email);
        if (existing != null) throw new InvalidOperationException("Email already registered.");
        var user = new User { Email = email.Trim().ToLowerInvariant(), PasswordHash = BCrypt.Net.BCrypt.HashPassword(password) };
        await _users.InsertOneAsync(user);
        return user;
    }
    public bool VerifyPassword(User user, string password) => BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
}
CS

cat > server/Services/JwtService.cs <<'CS'
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Server.Services;
public class JwtService
{
    private readonly string _secret;
    public JwtService(IConfiguration cfg)
    {
        _secret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? cfg["Jwt:Secret"] ?? throw new Exception("JWT secret not configured");
    }
    public string CreateToken(string userId, string email, TimeSpan? lifetime = null)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[] { new Claim(JwtRegisteredClaimNames.Sub, userId), new Claim(JwtRegisteredClaimNames.Email, email) };
        var token = new JwtSecurityToken(claims: claims, expires: DateTime.UtcNow.Add(lifetime ?? TimeSpan.FromDays(7)), signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
CS

cat > server/Services/AnalyticsService.cs <<'CS'
using MongoDB.Bson;
using MongoDB.Driver;
using Server.Models;

namespace Server.Services;
public class AnalyticsService
{
    private readonly IMongoCollection<AnalyticsRecord> _collection;
    public AnalyticsService(IConfiguration cfg, IMongoClient client)
    {
        var db = client.GetDatabase(cfg["Mongo:Database"] ?? "devanalytics");
        _collection = db.GetCollection<AnalyticsRecord>("records");
        _collection.Indexes.CreateOne(new CreateIndexModel<AnalyticsRecord>(
            Builders<AnalyticsRecord>.IndexKeys.Ascending(x => x.UserId).Ascending(x => x.LanguageId)
        ));
    }
    public Task InsertAsync(AnalyticsRecord rec) => _collection.InsertOneAsync(rec);
    public Task InsertManyAsync(IEnumerable<AnalyticsRecord> recs) => _collection.InsertManyAsync(recs);
    public async Task<List<AnalyticsRecord>> ForUserAsync(string userId) =>
        await _collection.Find(Builders<AnalyticsRecord>.Filter.Eq(x => x.UserId, userId)).ToListAsync();
    public async Task<object> SummaryAsync() => await _collection.Aggregate<object>(new[] {
        new BsonDocument("$group", new BsonDocument { 
            { "_id", "$LanguageId" },
            { "seconds", new BsonDocument("$sum", "$Seconds") },
            { "filesOpened", new BsonDocument("$sum", "$FilesOpened") },
            { "keystrokes", new BsonDocument("$sum", "$Keystrokes") }
        })
    }).ToListAsync();
    public async Task<List<string>> GetAllUsersAsync() =>
        await _collection.Distinct<string>("UserId", Builders<AnalyticsRecord>.Filter.Empty).ToListAsync();
}
CS

# Program.cs
cat > server/Program.cs <<'CS'
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using Server.Models;
using Server.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.AllowAnyHeader().AllowAnyMethod().WithOrigins("http://localhost:5173")));
builder.Services.AddSingleton<IMongoClient>(_ => new MongoClient(Environment.GetEnvironmentVariable("MONGODB_URI") ?? "mongodb://localhost:27017"));
builder.Services.AddSingleton<AnalyticsService>();
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<JwtService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? builder.Configuration["Jwt:Secret"] ?? throw new Exception("JWT_SECRET missing");
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(o => o.TokenValidationParameters = new TokenValidationParameters {
    ValidateIssuer = false, ValidateAudience = false, ValidateLifetime = true, ValidateIssuerSigningKey = true, IssuerSigningKey = key
});
var app = builder.Build();
app.UseCors(); app.UseAuthentication(); app.UseAuthorization();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }

app.MapPost("/api/auth/register", async (Server.DTOs.RegisterRequest r, UserService users, JwtService jwt) => {
    var u = await users.CreateAsync(r.Email, r.Password);
    var t = jwt.CreateToken(u.Id, u.Email);
    return Results.Ok(new Server.DTOs.AuthResponse { Token = t, Email = u.Email });
});
app.MapPost("/api/auth/login", async (Server.DTOs.LoginRequest r, UserService users, JwtService jwt) => {
    var u = await users.FindByEmailAsync(r.Email);
    if (u == null || !users.VerifyPassword(u, r.Password)) return Results.Unauthorized();
    var t = jwt.CreateToken(u.Id, u.Email);
    return Results.Ok(new Server.DTOs.AuthResponse { Token = t, Email = u.Email });
});
app.MapGet("/api/analytics/users", async (AnalyticsService s) => Results.Ok(await s.GetAllUsersAsync()));
app.MapGet("/api/health", () => Results.Ok(new { ok = true, ts = DateTime.UtcNow }));
Console.WriteLine("✅ Server ready: http://localhost:5000/swagger");
app.Run();
CS

echo "✅ All files created successfully."
