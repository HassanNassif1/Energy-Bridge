using Energy_Bridge.Data;
using Energy_Bridge.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Energy_Bridge.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BusinessTypesController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public BusinessTypesController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        // ========================================
        // ✅ GET ALL BUSINESS TYPES
        // ========================================
        [HttpGet]
        public IActionResult GetAllBusinessTypes()
        {
            var businessTypes = dbContext.BusinessTypes.ToList();
            return Ok(businessTypes);
        }

        // ========================================
        // ✅ CREATE BUSINESS TYPE
        // ========================================
        [HttpPost("CreateBusiness")]
        [Authorize]
        public IActionResult AddBusinessType([FromBody] BusinessType businessType)
        {
            var username = User?.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("User identity not found.");

            var user = dbContext.Users.FirstOrDefault(u => u.username == username);
            if (user == null)
                return Unauthorized("User not found.");

            // Check duplicate business type
            bool exists = dbContext.BusinessTypes
                .Any(bt => bt.type.ToLower() == businessType.type.ToLower());

            if (exists)
                return Conflict("This business type already exists.");

            // Track who created it
        
            dbContext.BusinessTypes.Add(businessType);
            dbContext.SaveChanges();

            return Ok(businessType);
        }

        // ========================================
        // ✅ UPDATE BUSINESS TYPE
        // ========================================
     [HttpPut("{id}")]
[Authorize]
public IActionResult UpdateBusinessType(int id, [FromBody] BusinessType updatedBusinessType)
{
    var existing = dbContext.BusinessTypes.FirstOrDefault(bt => bt.id == id);

    if (existing == null)
        return NotFound("Business type not found.");

    var oldType = existing.type;

    // Update the BusinessType
    existing.type = updatedBusinessType.type ?? existing.type;
    dbContext.SaveChanges();

    // Update all clients that had the old business type
    var affectedClients = dbContext.Clients
        .Where(c => c.business_type == oldType)
        .ToList();

    affectedClients.ForEach(c => c.business_type = existing.type);
    dbContext.SaveChanges();

    return Ok(new { message = "Business type and clients updated successfully." });
}

        [HttpDelete("{id}")]
public IActionResult DeleteBusinessTypes(int id)
{
    var b = dbContext.BusinessTypes.Find(id);
    if (b == null) return NotFound("Business Type not found.");
    dbContext.BusinessTypes.Remove(b);
    dbContext.SaveChanges();
    return Ok("Business Type deleted successfully");
}

    }
}
