using System.ComponentModel.DataAnnotations;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Energy_Bridge.Data;
using Energy_Bridge.Models.Entities;

namespace Energy_Bridge.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        private readonly IConfiguration _config;

        public UsersController(ApplicationDbContext dbContext, IConfiguration config)
        {
            this.dbContext = dbContext;
            this._config = config;
        }

        [HttpPut("{id:int}")]
public IActionResult UpdateUser(int id, [FromBody] User updatedUser)
{
    if (updatedUser == null)
        return BadRequest("User data is required.");

    var existingUser = dbContext.Users.Find(id);
    if (existingUser == null)
        return NotFound("User not found.");

    // Update username
    if (!string.IsNullOrWhiteSpace(updatedUser.username) && existingUser.username != updatedUser.username)
    {
        bool usernameExists = dbContext.Users.Any(u => u.username == updatedUser.username && u.id != id);
        if (usernameExists)
            return Conflict($"Username '{updatedUser.username}' is already taken.");

        existingUser.username = updatedUser.username;
    }

    // Update status & role
    existingUser.status = updatedUser.status ?? existingUser.status;
    existingUser.role_id = updatedUser.role_id;

    // Update password + plain_password
    if (!string.IsNullOrWhiteSpace(updatedUser.password))
    {
        // update plain (raw) password for frontend visibility
        existingUser.plain_password = updatedUser.password;

        // update hashed password
        var passwordHasher = new PasswordHasher<User>();
        existingUser.password = passwordHasher.HashPassword(existingUser, updatedUser.password);
    }

    dbContext.SaveChanges();
    return Ok(existingUser);
}
[Authorize]
[HttpGet("me-chat")]
public IActionResult CurrentUserChat()
{
    var username = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value ?? "Unknown";
    var id = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value ?? "Unknown";
    var roleId = User.Claims.FirstOrDefault(c => c.Type == "roleId")?.Value ?? "Unknown";
    var status = User.Claims.FirstOrDefault(c => c.Type == "status")?.Value ?? "Unknown";

    return Ok(new { username, roleId, id, status });
}

      [HttpGet]
public IActionResult GetUsers()
{
    var users = dbContext.Users
        .Select(u => new {
            u.id,
            u.username,
            u.status,
            u.role_id,
            u.plain_password, // <---- RETURN THIS,
            u.Permissions
        })
        .ToList();

    return Ok(users);
}


        [HttpGet("{id:int}")]
        public IActionResult GetUserById(int id)
        {
            var user = dbContext.Users.Find(id);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

[HttpPost("adduser")]
public IActionResult AddUser([FromBody] User user)
{
    if (dbContext.Users.Any(u => u.username == user.username))
        return Conflict($"User with username '{user.username}' already exists.");

    user.status ??= "active";

    // Store original password
    user.plain_password = user.password;

    // Hash
    var passwordHasher = new PasswordHasher<User>();
    user.password = passwordHasher.HashPassword(user, user.password);

    dbContext.Users.Add(user);
    dbContext.SaveChanges();

    return Ok(user);
}


        [HttpDelete("all")]
public IActionResult DeleteAllUserHistories()
{
    var allHistory = dbContext.UserHistories.ToList();

    if (!allHistory.Any())
        return NotFound("No history logs found to delete.");

    dbContext.UserHistories.RemoveRange(allHistory);
    dbContext.SaveChanges();

    return Ok("All history logs deleted successfully.");
}


     [HttpPost("checklogin")]
public IActionResult CheckLoginCredentials([FromBody] User loginUser)
{
    if (loginUser == null || string.IsNullOrEmpty(loginUser.username) || string.IsNullOrEmpty(loginUser.password))
        return BadRequest(new { message = "Username and password are required." });

    var user = dbContext.Users.FirstOrDefault(u => u.username == loginUser.username);
    if (user == null)
        return NotFound(new { message = "User not found." });

    if (user.status?.Trim().ToLowerInvariant() != "active")
        return Unauthorized(new { message = "User account is inactive" });

    try
    {
        var passwordHasher = new PasswordHasher<User>();
        var result = passwordHasher.VerifyHashedPassword(user, user.password, loginUser.password);
        if (result != PasswordVerificationResult.Success)
            return Unauthorized(new { message = "Incorrect password" });
    }
    catch
    {
        if (user.password != loginUser.password)
            return Unauthorized(new { message = "Incorrect password" });
    }

    // ✅ Log login activity
    dbContext.UserHistories.Add(new UserHistory
    {
        username = user.username,
        password = user.password,
        role_id = user.role_id,
        status = "LoggedIn",
        created_at = DateTime.UtcNow
    });
    dbContext.SaveChanges();

    // ✅ Create JWT
    var key = Encoding.ASCII.GetBytes(_config["JwtSettings:SecretKey"] ?? throw new Exception("JWT Secret missing"));
    var tokenHandler = new JwtSecurityTokenHandler();
    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Name, user.username ?? string.Empty),
            new Claim("UserId", user.id.ToString()),
            new Claim("roleId", user.role_id.ToString()),
            new Claim("status", user.status ?? "active")
        }),
        Expires = DateTime.UtcNow.AddMinutes(30),
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
    };

    var token = tokenHandler.CreateToken(tokenDescriptor);
    return Ok(new { token = tokenHandler.WriteToken(token) });
}

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            if (int.TryParse(userIdClaim, out int id))
            {
                var user = dbContext.Users.Find(id);
                if (user != null)
                {
                    dbContext.UserHistories.Add(new UserHistory
                    {
                        username = user.username ?? "Unknown",
                        password = user.password ?? "",
                        role_id = user.role_id,
                        status = "LoggedOut",
                        created_at = DateTime.UtcNow
                    });

                    dbContext.SaveChanges();
                }
            }

            return Ok(new { message = "Logged out successfully" });
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var token = HttpContext.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            if (!string.IsNullOrEmpty(token))
            {
                var jwtToken = new JwtSecurityTokenHandler().ReadToken(token) as JwtSecurityToken;
                if (jwtToken != null && jwtToken.ValidTo < DateTime.UtcNow)
                {
                    return Unauthorized("Token has expired.");
                }
            }

            var username = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value ?? "Unknown";
            var id = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value ?? "Unknown";
            var roleId = User.Claims.FirstOrDefault(c => c.Type == "roleId")?.Value ?? "Unknown";
            var status = User.Claims.FirstOrDefault(c => c.Type == "status")?.Value ?? "Unknown";

            return Ok(new { username, roleId, id, status });
        }

        [HttpGet("history/{userId:int}")]
        public IActionResult GetUserHistory(int userId)
        {
            var user = dbContext.Users.Find(userId);
            if (user == null)
                return NotFound("User not found.");

            var history = dbContext.UserHistories
                .Where(h => h.username == user.username)
                .OrderByDescending(h => h.created_at)
                .Select(h => new
                {
                    h.id,
                    h.status,
                    h.role_id,
                    h.username,
                    created_at = h.created_at.ToString("yyyy-MM-dd HH:mm:ss")
                })
                .ToList();

            return Ok(history);
        }

        [HttpDelete("{id:int}")]
        public IActionResult DeleteUser(int id)
        {
            var userToDelete = dbContext.Users.FirstOrDefault(u => u.id == id);
            if (userToDelete == null)
                return NotFound("User not found.");

            var roleName = dbContext.UserRoles.FirstOrDefault(r => r.id == userToDelete.role_id)?.role_name;

            if (roleName == "sales" && dbContext.Clients.Any(c => c.sales_exec.ToLower() == userToDelete.username.ToLower()))
                return Conflict("Cannot delete user. This sales executive is still assigned to client(s).");

            if (dbContext.Clients.Any(c => c.created_by == id))
                return Conflict("Cannot delete user. This user created client records.");

            dbContext.Users.Remove(userToDelete);
            dbContext.SaveChanges();

            return Ok("User deleted successfully.");
        }

        [HttpGet("search/{name}")]
        public IActionResult SearchUsersByName(string name)
        {
            var users = dbContext.Users.Where(e => e.username.Contains(name)).ToList();
            if (!users.Any())
                return NotFound();

            return Ok(users);
        }
    }

    
}
