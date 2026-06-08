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
    public class StockController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public StockController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllStocks()
        {
            var Stocks = dbContext.Stock.ToList(); // ✅ Semicolon fixed
            return Ok(Stocks); // ✅ Return the list of clients
        }

[HttpPost("CreateStock")]
public IActionResult AddStock(Stock s)
{
    if (s == null) return BadRequest("Stock is null");
    dbContext.Stock.Add(s);
    dbContext.SaveChanges();

    return Ok(s);
}


        [HttpPut("{id}")]
public IActionResult updateStock(int id, [FromBody] Stock updatedStock)
{
    var stock = dbContext.Stock.Find(id);
    if (stock == null)
    {
        return NotFound("Stock not found");
    }

            stock.connections = updatedStock.connections;
            stock.link_name = updatedStock.link_name;
            stock.type = updatedStock.type;
            stock.brand = updatedStock.brand;
            stock.sn = updatedStock.sn;
            stock.supplier = updatedStock.supplier;
            stock.price = updatedStock.price;
            stock.antenna_size = updatedStock.antenna_size;
            stock.purchase_date = updatedStock.purchase_date;
            stock.status = updatedStock.status;
            stock.created_by = updatedStock.created_by;
            stock.created_on = updatedStock.created_on;
   

    dbContext.SaveChanges(); // Only call once

    return Ok("Stock updated successfully");
}
[HttpDelete("{id}")]
public IActionResult DeleteStock(int id)
{
    var stock = dbContext.Stock.Find(id);
    if (stock == null) return NotFound("Stock not found.");
    dbContext.Stock.Remove(stock);
    dbContext.SaveChanges();
    return Ok("Stock deleted successfully");
}

    }
}
