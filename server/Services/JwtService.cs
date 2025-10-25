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
