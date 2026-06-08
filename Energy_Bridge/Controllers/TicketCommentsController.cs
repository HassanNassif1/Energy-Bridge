
using System.Net.Http.Headers;
using Energy_Bridge.Data;
using Energy_Bridge.Models;
using Energy_Bridge.Models.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations.Schema;
namespace Energy_Bridge.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketCommentsController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public TicketCommentsController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllComments()
        {
            var comments = dbContext.Ticket_Comments.ToList(); // ✅ Semicolon fixed
            return Ok(comments); // ✅ Return the list of clients
        }

 [Authorize]
[HttpPost("CreateComment")]
public IActionResult AddComment([FromBody] Ticket_Comments tc)
{
    var username = User.Identity?.Name;
    if (string.IsNullOrEmpty(username))
        return Unauthorized();

    tc.author = username;
    tc.created_at = DateTime.UtcNow;

    dbContext.Ticket_Comments.Add(tc);
    dbContext.SaveChanges();

    return Ok(tc);
}

      [HttpPut("{id}")]
public IActionResult updateComment(int id, [FromBody] Ticket_Comments updatedComment)
{
    var tc = dbContext.Ticket_Comments.Find(id);
    if (tc == null)
    {
        return NotFound("Comment not found");
    }

    tc.ticket_id = updatedComment.ticket_id;
    tc.author = updatedComment.author;
    tc.comment = updatedComment.comment;

    dbContext.SaveChanges();

    return Ok("Comment updated successfully");
}

[HttpDelete("{id}")]
public IActionResult DeleteComment(int id)
{
    var tc = dbContext.Ticket_Comments.Find(id);
    if (tc == null) return NotFound("comment not found.");
    dbContext.Ticket_Comments.Remove(tc);
    dbContext.SaveChanges();
    return Ok("Comment deleted successfully");
}

    }
}
