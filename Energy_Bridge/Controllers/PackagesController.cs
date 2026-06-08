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
    public class PackagesController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public PackagesController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllPackages()
        {
            var packages = dbContext.Packages.ToList(); // ✅ Semicolon fixed
            return Ok(packages); // ✅ Return the list of clients
        }

        [HttpPost("CreatePackage")]
        public IActionResult AddPackage(Package p)
        {
            dbContext.Packages.Add(p);
            dbContext.SaveChanges();

            return Ok(p);
        }
        [HttpDelete]
        [Route("{id:int}")]
        public IActionResult DeletePackage(int id)
        {
            var package = dbContext.Packages.Find(id);
            dbContext.Remove(package);
            dbContext.SaveChanges();
            return Ok(package);
        }
        [HttpPut]
[Route("{id:int}")]
public IActionResult UpdatePackage(int id, [FromBody] Package updatedPackage)
{
    var package = dbContext.Packages.Find(id);
    if (package == null)
    {
        return NotFound("Package not found");
    }

    package.service_type = updatedPackage.service_type;
    package.package_name = updatedPackage.package_name;
    package.price = updatedPackage.price;
    package.notes = updatedPackage.notes;
    package.bandwidth = updatedPackage.bandwidth;

    dbContext.SaveChanges(); // Only call once

    return Ok("Package updated successfully");
}

    }
    
}
