using System.ComponentModel.DataAnnotations;
using Energy_Bridge.Data;
using Energy_Bridge.Models.Entities;
using Energy_Bridge.Models.DTOs;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Energy_Bridge.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        private static readonly string[] AllowedSeverities = { "Low", "Medium", "High", "Critical" };
        private static readonly string[] AllowedCategories = { "Internet", "Hardware", "Billing", "Maintenance", "Visit","Connection Shifting","No Internet","Off-On","Paid Service","Ping Break","Renewal Tickets","Speed Slow" };
        private static readonly string[] AllowedStatusesAdd = { "OPEN", "IN PROGRESS", "PENDING" };
        private static readonly string[] AllowedStatusesEdit = { "OPEN", "IN PROGRESS", "PENDING", "CLOSED" };
        private static readonly string[] AllowedCategoriesEdit = { "Internet", "Hardware", "Billing", "Maintenance", "Visit","Connection Shifting","No Internet","Off-On","Paid Service","Ping Break","Renewal Tickets","Speed Slow" };
        private static readonly string[] AllowedCallSource = { "Mobile", "Email", "On-Site", "Phone" };
        private static readonly string[] AllowedCallSourceEdit = { "Mobile", "Email", "On-Site", "Phone" };

        public TicketsController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

    [HttpGet]
public IActionResult GetAllTickets()
{
    var username = User.Identity?.Name;
    if (string.IsNullOrEmpty(username))
        return Unauthorized();

    var user = dbContext.Users.FirstOrDefault(u => u.username == username);
    if (user == null)
        return NotFound("User not found.");

    if (user.role_id == 1) // admin
    {
        return Ok(dbContext.Tickets.ToList());
    }

    // Non-admins: only tickets assigned to them or created by them
    var tickets = dbContext.Tickets
        .Where(t =>
            t.assigned_user == user.id ||
            t.user_id == user.id
        )
        .ToList();

    return Ok(tickets);
}

        [HttpGet("TicketHistories")]
        public IActionResult GetAllTicketHistories()
        {
            var histories = dbContext.TicketHistories.ToList();
            return Ok(histories);
        }
[HttpGet("TicketHistories/{ticketId}/User")]
public IActionResult GetTicketHistoriesByTicketForUser(int ticketId)
{
    var username = User.Identity?.Name;
    if (string.IsNullOrEmpty(username))
        return Unauthorized("User identity not found.");

    var user = dbContext.Users.FirstOrDefault(u => u.username == username);
    if (user == null)
        return NotFound("User not found.");

    // Fetch histories for the ticket
    var histories = dbContext.TicketHistories
        .Where(th => th.ticket_id == ticketId)
        .OrderByDescending(th => th.created_at)
        .ToList();

    if (!histories.Any())
        return NotFound("No ticket histories found for this ticket.");

    // Admin can see everything
    var isAdmin = user.role_id == 1;

    // Check if user is currently assigned in any history or was involved before
    var isCurrentlyAssigned = histories.Any(th => th.assigned_to == user.role_id || th.assigned_to == user.id + 1000);
    var wasInvolvedBefore = histories.Any(th => th.user_id == user.id);

    if (!isAdmin && !isCurrentlyAssigned && !wasInvolvedBefore)
        return Forbid("You do not have permission to view this ticket's history.");

    return Ok(histories);
}

[HttpPut("MarkAsViewed/{ticketId}")]
public IActionResult MarkTicketAsViewed(int ticketId)
{
    var ticket = dbContext.Tickets.FirstOrDefault(t => t.id == ticketId);
    if (ticket == null)
        return NotFound("Ticket not found.");

  var username =
    User.Claims.FirstOrDefault(c => c.Type == "username")?.Value ??
    User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value ??
    User.Identity?.Name;


    if (string.IsNullOrEmpty(username))
        return Unauthorized("User identity not found.");

    var user = dbContext.Users.FirstOrDefault(u => u.username == username);
    if (user == null)
        return NotFound("User not found.");

    ticket.isViewed = true;
    ticket.viewedBy = username;

    dbContext.SaveChanges();

  var history = new TicketHistory
{
    ticket_id = ticket.id,
    client_id = ticket.client_id,
    subject = ticket.subject,
    description = ticket.description,
    category = ticket.category,
    severity = ticket.severity,
    status = ticket.status,
    assigned_to = ticket.assigned_to,
    call_source = ticket.call_source,
    notification = ticket.notification,
    user_id = user.id,
    created_at = DateTime.Now,
    viewedBy = username,
    isViewed = true
};

dbContext.TicketHistories.Add(history);
dbContext.SaveChanges();


    return Ok(new { success = true, ticket });
}
[HttpGet("ByClientWithName/{referenceId}")]
public IActionResult GetTicketsByClientWithName(string referenceId)
{
    var tickets = dbContext.Tickets
        .Where(t => t.client_id == referenceId)
        .Join(dbContext.Clients,
              t => t.client_id,
              c => c.reference_id,
              (ticket, client) => new TicketWithClientDto
              {
                  Id = ticket.id,
                  ClientId = client.reference_id,
                  ClientFirstName = client.first_name,
                  ClientLastName = client.last_name,
                  Subject = ticket.subject,
                  Description = ticket.description,
                  Category = ticket.category,
                  Severity = ticket.severity,
                  Status = ticket.status,
                  AssignedTo = ticket.assigned_to,
                  AssignedUser = ticket.assigned_user,
                  CallSource = ticket.call_source,
                  IsViewed = ticket.isViewed,
                  ViewedBy = ticket.viewedBy
              })
        .ToList();

    if (!tickets.Any())
        return NotFound("No tickets found for the specified client.");

    return Ok(tickets);
}
[HttpGet("WithClientInfo")]
public IActionResult GetTicketsWithClientInfo()
{
    var username = User.Identity?.Name;
    if (string.IsNullOrEmpty(username))
        return Unauthorized();

    var user = dbContext.Users.FirstOrDefault(u => u.username == username);
    if (user == null)
        return NotFound("User not found.");

    IQueryable<Ticket> query;

    if (user.role_id == 1) // admin sees all
    {
        query = dbContext.Tickets;
    }
    else // non-admin: only assigned or created tickets
    {
        int userAsAssignedId = user.id + 1000;
        query = dbContext.Tickets.Where(t =>
            t.assigned_user == user.id ||
            t.assigned_to == user.role_id ||
            t.assigned_to == userAsAssignedId ||
            t.user_id == user.id
        );
    }

    var result = query
        .Join(dbContext.Clients,
            ticket => ticket.client_id,
            client => client.reference_id,
            (ticket, client) => new TicketWithClientDto
            {
                Id = ticket.id,
                ClientId = client.reference_id,
                ClientFirstName = client.first_name,
                ClientLastName = client.last_name,
                Subject = ticket.subject,
                Description = ticket.description,
                Category = ticket.category,
                Severity = ticket.severity,
                Status = ticket.status,
                AssignedTo = ticket.assigned_to,
                AssignedUser = ticket.assigned_user,
                CallSource = ticket.call_source,
                IsViewed = ticket.isViewed,
                ViewedBy = ticket.viewedBy
            })
        .ToList();

    return Ok(result);
}

[HttpGet("ByClient/{referenceId}")]
public IActionResult GetTicketsByClient(string referenceId)
{
    var tickets = dbContext.Tickets
        .Where(t => t.client_id == referenceId)
        .ToList();

    if (!tickets.Any())
        return NotFound("No tickets found for the specified client.");

    return Ok(tickets);
}



[HttpGet("ViewedTickets")]
public IActionResult GetViewedTickets()
{
    var username = User.Identity?.Name;
    if (string.IsNullOrEmpty(username))
        return Unauthorized("User identity not found.");

    var tickets = dbContext.Tickets
        .Where(t => t.viewedBy == username)
        .ToList();

    return Ok(tickets);
}

[HttpGet("UnviewedTickets")]
public IActionResult GetUnviewedTickets()
{
    var username = User.Identity?.Name;
    if (string.IsNullOrEmpty(username))
        return Unauthorized("User identity not found.");

    var tickets = dbContext.Tickets
        .Where(t => !t.isViewed || t.viewedBy != username)
        .ToList();

    return Ok(tickets);
}

[HttpPost("CreateTickets")]
public IActionResult AddTickets([FromBody] Ticket ticket)
{
    if (!IsSeverityValid(ticket.severity))
        return BadRequest($"Invalid severity. Allowed values: {string.Join(", ", AllowedSeverities)}");

    if (!IsStatusValidAdd(ticket.status))
        return BadRequest($"Invalid status. Allowed values: {string.Join(", ", AllowedStatusesAdd)}");

    // ✅ Normalize assigned_user BEFORE saving
    if (ticket.assigned_to > 0 && (!ticket.assigned_user.HasValue || ticket.assigned_user.Value == 0))
    {
        ticket.assigned_user = null;
    }

    dbContext.Tickets.Add(ticket);
    dbContext.SaveChanges();

    var ticketHistory = new TicketHistory
    {
        ticket_id = ticket.id,
        client_id = ticket.client_id,
        subject = ticket.subject,
        description = ticket.description,
        category = ticket.category,
        severity = ticket.severity,
        status = ticket.status,
        assigned_to = ticket.assigned_to,
        assigned_user = ticket.assigned_user, // now correctly null if department assigned
        call_source = ticket.call_source,
        notification = ticket.notification,
        user_id = ticket.user_id,
        created_at = DateTime.Now
    };

    dbContext.TicketHistories.Add(ticketHistory);
    dbContext.SaveChanges();

    return Ok(ticket);
}

 [HttpPut("{id}")]
public IActionResult UpdateTickets(int id, [FromBody] Ticket updatedTicket)
{
    var ticket = dbContext.Tickets.Find(id);
    if (ticket == null)
        return NotFound("Ticket not found.");

    var username = User.Identity?.Name;
    if (string.IsNullOrEmpty(username))
        return Unauthorized("User identity not found.");

    var currentUser = dbContext.Users.FirstOrDefault(u => u.username == username);
    if (currentUser == null)
        return NotFound("User not found.");

    // Validate severity and status
    if (!IsSeverityValid(updatedTicket.severity))
        return BadRequest($"Invalid severity. Allowed values: {string.Join(", ", AllowedSeverities)}");

    if (!IsStatusValidEdit(updatedTicket.status))
        return BadRequest($"Invalid status. Allowed values: {string.Join(", ", AllowedStatusesEdit)}");

    // --- Save the current state to history BEFORE updating ---
    var ticketHistoryBeforeUpdate = new TicketHistory
    {
        ticket_id = ticket.id,
        client_id = ticket.client_id,
        subject = ticket.subject,
        description = ticket.description,
        category = ticket.category,
        severity = ticket.severity,
        status = ticket.status,
        assigned_to = ticket.assigned_to,
        assigned_user = ticket.assigned_user,
        call_source = ticket.call_source,
        notification = ticket.notification,
        user_id = currentUser.id,
        viewedBy = ticket.viewedBy,
        isViewed = ticket.isViewed,
        created_at = DateTime.Now
    };
    dbContext.TicketHistories.Add(ticketHistoryBeforeUpdate);

    // --- Update all fields ---
    ticket.client_id = updatedTicket.client_id;
    ticket.subject = updatedTicket.subject;
    ticket.description = updatedTicket.description;
    ticket.category = updatedTicket.category;
    ticket.severity = updatedTicket.severity;
    ticket.status = updatedTicket.status;
    ticket.call_source = updatedTicket.call_source;
    ticket.isViewed = updatedTicket.isViewed;
    ticket.viewedBy = updatedTicket.viewedBy;

    ticket.assigned_to = updatedTicket.assigned_to > 0 ? updatedTicket.assigned_to : null;
    ticket.assigned_user = updatedTicket.assigned_user.HasValue && updatedTicket.assigned_user.Value > 0
        ? updatedTicket.assigned_user
        : null;

    // Save changes
    try
    {
        dbContext.SaveChanges();
    }
    catch (Exception ex)
    {
        return BadRequest(new { error = ex.Message });
    }

    return Ok("Ticket updated successfully (history saved).");
}


[HttpGet("{id}")]
public IActionResult GetTicketById(int id)
{
    var username = User.Identity?.Name;
    if (string.IsNullOrEmpty(username))
        return Unauthorized();

    var user = dbContext.Users.FirstOrDefault(u => u.username == username);
    if (user == null)
        return NotFound("User not found.");

    var ticket = dbContext.Tickets.FirstOrDefault(t => t.id == id);
    if (ticket == null)
        return NotFound("Ticket not found.");

    if (user.role_id != 1 && ticket.assigned_user != user.id && ticket.user_id != user.id)
        return Forbid("You do not have permission to view this ticket.");

    return Ok(ticket);
}

  [HttpGet("GetTicketsByUserRole")]
public IActionResult GetTicketsByUserRole()
{
    var username = User.Identity?.Name;
    if (string.IsNullOrEmpty(username))
        return Unauthorized("User identity not found.");

    var user = dbContext.Users.FirstOrDefault(u => u.username == username);
    if (user == null)
        return NotFound("User not found.");

    var userId = user.id;
    var userRoleId = user.role_id;

    // Admin sees everything
    if (userRoleId == 1 || userRoleId == 7 || userRoleId == 6)
    {
        var allTickets = dbContext.Tickets.ToList();
        return Ok(allTickets);
    }

    // Non-admin: only tickets where
    // 1. The user created it
    // 2. The ticket is assigned to them
    // 3. The ticket is assigned to their role (department)
    var tickets = dbContext.Tickets
        .Where(t =>
            t.user_id == userId ||              // Created by the user
            t.assigned_user == userId ||        // Assigned to this user
            t.assigned_to == userRoleId         // Assigned to this role/department
        )
        .ToList();

    return Ok(tickets);
}


[HttpDelete("{id}")]
public IActionResult DeleteTickets(int id)
{
    var ticket = dbContext.Tickets.FirstOrDefault(t => t.id == id);
    if (ticket == null)
        return NotFound("Ticket not found.");

    // Check if ANY ticket for the same client is OPEN (including the one being deleted)
    bool clientHasOpenTicket = dbContext.Tickets
        .Any(t => t.client_id == ticket.client_id && t.status.ToUpper() == "OPEN");

    if (clientHasOpenTicket)
    {
        return BadRequest("Cannot delete any ticket for this client because they have at least one OPEN ticket.");
    }

    // Move ticket to TicketHistories before deleting
    var username = User.Identity?.Name;
    var user = dbContext.Users.FirstOrDefault(u => u.username == username);

    var ticketHistory = new TicketHistory
    {
        ticket_id = ticket.id,
        client_id = ticket.client_id,
        subject = ticket.subject,
        description = ticket.description,
        category = ticket.category,
        severity = ticket.severity,
        status = ticket.status,
        assigned_to = ticket.assigned_to,
        assigned_user = ticket.assigned_user,
        call_source = ticket.call_source,
        notification = ticket.notification,
        user_id = user != null ? user.id : (int?)null,
        created_at = DateTime.Now,
        isViewed = ticket.isViewed,
        viewedBy = ticket.viewedBy
    };

dbContext.TicketHistories.Add(ticketHistory);
dbContext.SaveChanges();  // Ensure history is saved first
dbContext.Tickets.Remove(ticket);
dbContext.SaveChanges();  // Then delete the ticket


    return Ok("Ticket moved to history and deleted successfully");
}


        private bool IsSeverityValid(string? severity) =>
            !string.IsNullOrWhiteSpace(severity) &&
            AllowedSeverities.Contains(severity, StringComparer.OrdinalIgnoreCase);

        private bool IsCategoryValid(string? category) =>
            !string.IsNullOrWhiteSpace(category) &&
            AllowedCategories.Contains(category, StringComparer.OrdinalIgnoreCase);

        private bool IsCategoryValidEdit(string? category) =>
            !string.IsNullOrWhiteSpace(category) &&
            AllowedCategoriesEdit.Contains(category, StringComparer.OrdinalIgnoreCase);

        private bool IsCallSourceValid(string? callsource) =>
            !string.IsNullOrWhiteSpace(callsource) &&
            AllowedCallSource.Contains(callsource, StringComparer.OrdinalIgnoreCase);

        private bool IsCallSourceValidEdit(string? callsource) =>
            !string.IsNullOrWhiteSpace(callsource) &&
            AllowedCallSourceEdit.Contains(callsource, StringComparer.OrdinalIgnoreCase);

        private bool IsStatusValidAdd(string? status) =>
            !string.IsNullOrWhiteSpace(status) &&
            AllowedStatusesAdd.Contains(status, StringComparer.OrdinalIgnoreCase);

        private bool IsStatusValidEdit(string? status) =>
            !string.IsNullOrWhiteSpace(status) &&
            AllowedStatusesEdit.Contains(status, StringComparer.OrdinalIgnoreCase);
    }
}
