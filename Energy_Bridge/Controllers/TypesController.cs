using System.ComponentModel.DataAnnotations;
using System.Net.Http.Headers;
using Energy_Bridge.Data;
using Energy_Bridge.Models;
using Energy_Bridge.Models.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Diagnostics;
namespace Energy_Bridge.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TypesController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public TypesController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllTypes()
        {
            var Types = dbContext.Types.ToList(); // ✅ Semicolon fixed
            return Ok(Types); // ✅ Return the list of clients
        }

        [HttpPost("CreateType")]
        public IActionResult AddType(Types t)
        {
            dbContext.Types.Add(t);
            dbContext.SaveChanges();

            return Ok(t);
        }
        [HttpPut("{id}")]
public IActionResult updateType(int id, [FromBody] Types updatedType)
{
    var type = dbContext.Types.Find(id);
    if (type == null)
    {
        return NotFound("Type not found");
    }

    type.type = updatedType.type;
   

    dbContext.SaveChanges(); // Only call once

    return Ok("Type updated successfully");
}
[HttpDelete("{id}")]
public IActionResult DeleteType(int id)
{
    var type = dbContext.Types.Find(id);
    if (type == null) return NotFound("Type not found.");
    dbContext.Types.Remove(type);
    dbContext.SaveChanges();
    return Ok("Type deleted successfully");
}

    }
}
