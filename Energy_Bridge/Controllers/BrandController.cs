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
    public class BrandController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public BrandController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllBrands()
        {
            var Brands = dbContext.Brand.ToList(); // ✅ Semicolon fixed
            return Ok(Brands); // ✅ Return the list of clients
        }

        [HttpPost("CreateBrand")]
        public IActionResult AddBrand(Brand b)
        {
            dbContext.Brand.Add(b);
            dbContext.SaveChanges();

            return Ok(b);
        }
        [HttpPut("{id}")]
public IActionResult updateBrand(int id, [FromBody] Brand updatedBrand)
{
    var brand = dbContext.Brand.Find(id);
    if (brand == null)
    {
        return NotFound("Type not found");
    }

    brand.brand = updatedBrand.brand;
    brand.status = updatedBrand.status;
   

    dbContext.SaveChanges(); // Only call once

    return Ok("Dsp updated successfully");
}
[HttpDelete("{id}")]
public IActionResult DeleteBrand(int id)
{
    var brand = dbContext.Brand.Find(id);
    if (brand == null) return NotFound("Brand not found.");
    dbContext.Brand.Remove(brand);
    dbContext.SaveChanges();
    return Ok("Brand deleted successfully");
}

    }
}
