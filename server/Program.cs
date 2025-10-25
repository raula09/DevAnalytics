using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using Server.Models;
using Server.Services;

var builder = WebApplication.CreateBuilder(args);

// --- CORS ---
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173")
     .AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials()
));

// --- MongoDB ---
builder.Services.AddSingleton<IMongoClient>(_ =>
    new MongoClient(Environment.GetEnvironmentVariable("MONGODB_URI") ?? "mongodb://localhost:27017"));

// --- Custom services ---
builder.Services.AddSingleton<AnalyticsService>();
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<JwtService>();

// --- JWT Setup ---
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? builder.Configuration["Jwt:Secret"]
    ?? throw new Exception("JWT_SECRET missing");

var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o => o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = key
    });

builder.Services.AddAuthorization();

// --- Swagger ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// --- Error Middleware ---
app.Use(async (ctx, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"🔥 Error: {ex.Message}");
        ctx.Response.StatusCode = 500;
        ctx.Response.ContentType = "application/json";
        await ctx.Response.WriteAsync($"{{\"error\": \"{ex.Message}\"}}");
    }
});

// --- Middleware Order ---
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// --- Endpoints ---

// 🟢 Auth
app.MapPost("/api/auth/register", async (Server.DTOs.RegisterRequest r, UserService users, JwtService jwt) =>
{
    var u = await users.CreateAsync(r.Email, r.Password);
    var t = jwt.CreateToken(u.Id, u.Email);
    return Results.Ok(new Server.DTOs.AuthResponse { Token = t, Email = u.Email });
});

app.MapPost("/api/auth/login", async (Server.DTOs.LoginRequest r, UserService users, JwtService jwt) =>
{
    var u = await users.FindByEmailAsync(r.Email);
    if (u == null || !users.VerifyPassword(u, r.Password))
        return Results.Unauthorized();

    var t = jwt.CreateToken(u.Id, u.Email);
    return Results.Ok(new Server.DTOs.AuthResponse { Token = t, Email = u.Email });
});

// 🟢 Analytics
app.MapGet("/api/analytics/users", async (AnalyticsService s) => Results.Ok(await s.GetAllUsersAsync()));

app.MapGet("/api/health", () => Results.Ok(new { ok = true, ts = DateTime.UtcNow }));

Console.WriteLine("✅ Server running on http://localhost:5000/swagger");
app.Run();
