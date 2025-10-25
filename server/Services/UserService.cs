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
