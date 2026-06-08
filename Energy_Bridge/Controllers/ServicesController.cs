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
    public class ServicesController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public ServicesController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllServices()
        {
            var Services = dbContext.Services.ToList(); // ✅ Semicolon fixed
            return Ok(Services); // ✅ Return the list of clients
        }

        // [HttpPost("CreateDsp")]
        // public IActionResult AddService(Dsp d)
        // {
        //     dbContext.Dsps.Add(d);
        //     dbContext.SaveChanges();

        //     return Ok(d);
        // }
    }
}
