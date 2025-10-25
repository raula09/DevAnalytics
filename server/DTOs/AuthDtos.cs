namespace Server.DTOs;
public class RegisterRequest { public string Email { get; set; } = ""; public string Password { get; set; } = ""; }
public class LoginRequest { public string Email { get; set; } = ""; public string Password { get; set; } = ""; }
public class AuthResponse { public string Token { get; set; } = ""; public string Email { get; set; } = ""; }
