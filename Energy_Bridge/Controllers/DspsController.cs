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
    public class DspsController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public DspsController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllDsps()
        {
            var Dsps = dbContext.Dsps.ToList(); // ✅ Semicolon fixed
            return Ok(Dsps); // ✅ Return the list of clients
        }

        [HttpPost("CreateDsp")]
        public IActionResult AddDsp(Dsp d)
        {
            dbContext.Dsps.Add(d);
            dbContext.SaveChanges();

            return Ok(d);
        }
[HttpPut("{id}")]
public IActionResult UpdateDsp(int id, [FromBody] Dsp updatedDsp)
{
    // 1. Get the existing DSP
    var dsp = dbContext.Dsps.Find(id);
    if (dsp == null) return NotFound("DSP not found.");

    // 2. Store old reference to update clients
    var oldCode = dsp.code;

    // 3. Update DSP
    dsp.name = updatedDsp.name;
    dsp.code = updatedDsp.code;
    dbContext.SaveChanges();

    // 4. Update clients whose reference_id starts with old DSP code
    var clientsToUpdate = dbContext.Clients
        .Where(c => c.reference_id.StartsWith(oldCode))
        .ToList();

    foreach (var client in clientsToUpdate)
    {
        client.reference_id = updatedDsp.code + client.reference_id.Substring(oldCode.Length);
    }

    dbContext.SaveChanges();

    return Ok("DSP and client reference_ids updated successfully");
}




[HttpDelete("{id}")]
public IActionResult DeleteDsp(int id)
{
    var dsp = dbContext.Dsps.Find(id);
    if (dsp == null) return NotFound("DSP not found.");
    dbContext.Dsps.Remove(dsp);
    dbContext.SaveChanges();
    return Ok("DSP deleted successfully");
}

    }
}
