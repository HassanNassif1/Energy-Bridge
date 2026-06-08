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
    public class SupplierController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public SupplierController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllSuppliers()
        {
            var Suppliers = dbContext.Supplier.ToList(); // ✅ Semicolon fixed
            return Ok(Suppliers); // ✅ Return the list of clients
        }

        [HttpPost("CreateSupplier")]
        public IActionResult AddSupplier(Supplier s)
        {
            dbContext.Supplier.Add(s);
            dbContext.SaveChanges();

            return Ok(s);
        }
        [HttpPut("{id}")]
public IActionResult updateSupplier(int id, [FromBody] Supplier updatedSupplier)
{
    var supplier = dbContext.Supplier.Find(id);
    if (supplier == null)
    {
        return NotFound("Supplier not found");
    }
    

    supplier.supplier = updatedSupplier.supplier;
    supplier.mobile = updatedSupplier.mobile;
     supplier.email = updatedSupplier.email;
    supplier.status = updatedSupplier.status;
   

    dbContext.SaveChanges(); // Only call once

    return Ok("Supplier updated successfully");
}
[HttpDelete("{id}")]
public IActionResult DeleteSupplier(int id)
{
    var supplier = dbContext.Supplier.Find(id);
    if (supplier == null) return NotFound("Supplier not found.");
    dbContext.Supplier.Remove(supplier);
    dbContext.SaveChanges();
    return Ok("Type deleted successfully");
}

    }
}
