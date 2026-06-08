using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using Energy_Bridge.Data;
using Energy_Bridge.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Energy_Bridge.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserRolesController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public UserRolesController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        // GET: api/UserRoles
        [HttpGet]
        public IActionResult GetUsers()
        {
            var userName = User?.Identity?.Name;
            if (string.IsNullOrEmpty(userName))
                return Unauthorized();

            var user = dbContext.Users.FirstOrDefault(u => u.username == userName);
            if (user == null)
                return Unauthorized();

            var userRole = dbContext.UserRoles.FirstOrDefault(r => r.id == user.role_id);
            if (userRole == null)
                return Unauthorized();

            // Filter for "support" role
            if (userRole.role_name.ToLower() == "support")
            {
                var filteredRoles = dbContext.UserRoles
                    .Where(r =>
                        r.role_name == "Sales Manager" ||
                        r.role_name == "sales" ||
                        r.role_name == "support" ||
                        r.role_name == "Support Manager")
                    .ToList();

                return Ok(filteredRoles);
            }

            var allRoles = dbContext.UserRoles.ToList();
            return Ok(allRoles);
        }

        // POST: api/UserRoles
        [HttpPost]
        public IActionResult PostUsers([FromBody] UserRoles userrole)
        {
            if (userrole == null)
                return BadRequest("Invalid user role data.");

            dbContext.UserRoles.Add(userrole);
            dbContext.SaveChanges();
            return Ok(userrole);
        }

        // Assign permissions to a role
        [HttpPost("AssignPermissions")]
        public IActionResult AssignPermissions([FromBody] AssignPermissionsDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrEmpty(dto.RoleName) || dto.Permissions == null)
                    return BadRequest("Invalid data.");

                var role = dbContext.UserRoles.FirstOrDefault(r => r.role_name.ToLower() == dto.RoleName.ToLower());
                if (role == null)
                    return NotFound("Role not found.");

                role.Permissions = JsonSerializer.Serialize(dto.Permissions);
                dbContext.SaveChanges();

                return Ok(role);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

  [HttpPost("AssignPermissionsToUser")]
public IActionResult AssignPermissionsToUser([FromBody] AssignPermissionsToUserDto dto)
{
    if (dto == null || dto.UserId <= 0)
        return BadRequest("Invalid data.");

    var user = dbContext.Users.FirstOrDefault(u => u.id == dto.UserId);
    if (user == null)
        return NotFound("User not found.");

    // ✅ REMOVE permissions when unchecked
    if (dto.Permissions == null || dto.Permissions.Count == 0)
    {
        user.Permissions = null; // clears DB field
    }
    else
    {
        user.Permissions = JsonSerializer.Serialize(dto.Permissions);
    }

    dbContext.SaveChanges();
    return Ok(user);
}


        // Get permissions for the logged-in user
        [HttpGet("permissions-for-user")]
        public IActionResult GetPermissionsForLoggedInUser()
        {
            var userName = User?.Identity?.Name;
            if (string.IsNullOrEmpty(userName))
                return Unauthorized();

            var user = dbContext.Users.FirstOrDefault(u => u.username == userName);
            if (user == null)
                return Unauthorized();

            var permissions = new List<string>();

            // 1️⃣ Check if user has direct permissions
            if (!string.IsNullOrEmpty(user.Permissions))
            {
                try
                {
                    permissions = JsonSerializer.Deserialize<List<string>>(user.Permissions);
                }
                catch
                {
                    permissions = new List<string>();
                }
            }
            else if (user.role_id.HasValue) // 2️⃣ fallback to role permissions
            {
                var role = dbContext.UserRoles.FirstOrDefault(r => r.id == user.role_id.Value);
                if (role != null && !string.IsNullOrEmpty(role.Permissions))
                {
                    try
                    {
                        permissions = JsonSerializer.Deserialize<List<string>>(role.Permissions);
                    }
                    catch
                    {
                        permissions = new List<string>();
                    }
                }
            }

            return Ok(permissions);
        }

        // DTOs
        public class AssignPermissionsDto
        {
            public string? RoleName { get; set; }
            public List<string>? Permissions { get; set; }
        }

        public class AssignPermissionsToUserDto
        {
            public int UserId { get; set; }
            public List<string>? Permissions { get; set; }
        }
    }
}
