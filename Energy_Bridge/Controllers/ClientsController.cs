using System.ComponentModel.DataAnnotations;
using Energy_Bridge.Data;
using Energy_Bridge.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Energy_Bridge.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public ClientsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllClients()
        {
            var clients = _dbContext.Clients.ToList();
            return Ok(clients);
        }

        [HttpPost("CreateClient")]
        [Authorize]
        public IActionResult AddClient([FromBody] Client? client)
        {
            if (client == null)
                return BadRequest("Client cannot be null.");

            var username = User?.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized();

            var user = _dbContext.Users.FirstOrDefault(u => u.username == username);
            if (user == null)
                return Unauthorized();

            var role = _dbContext.UserRoles.FirstOrDefault(r => r.id == user.role_id)?.role_name;
            if (role != "sales" && role != "admin" && role != "Sales Manager")
                return Forbid();

            if (string.IsNullOrEmpty(client.reference_id))
                return BadRequest(new { error = "Reference ID is required." });

            client.created_by = user.id;

            try
            {
                _dbContext.Clients.Add(client);
                _dbContext.SaveChanges();
                return Ok(client);
            }
            catch (DbUpdateException dbEx)
            {
                return StatusCode(500, $"Database error: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public IActionResult DeleteClient(int id)
        {
            try
            {
                var username = User?.Identity?.Name;
                if (string.IsNullOrEmpty(username))
                    return Unauthorized();

                var user = _dbContext.Users.FirstOrDefault(u => u.username == username);
                if (user == null)
                    return Unauthorized();

                var role = _dbContext.UserRoles.FirstOrDefault(r => r.id == user.role_id)?.role_name;
                if (string.IsNullOrEmpty(role))
                    return Forbid("User role not found.");

                Client? clientToDelete = role switch
                {
                    "admin" or "Sales Manager" => _dbContext.Clients.FirstOrDefault(c => c.id == id),
                    "sales" => _dbContext.Clients.FirstOrDefault(c => c.id == id && c.sales_exec == user.username),
                    _ => null
                };

                if (clientToDelete == null)
                    return NotFound("Client not found or not authorized to delete.");

                _dbContext.Clients.Remove(clientToDelete);
                _dbContext.SaveChanges();

                return Ok("Client deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("by-sales")]
        [Authorize]
        public IActionResult GetClientsCreatedBy()
        {
            var username = User?.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("User identity not found.");

            var user = _dbContext.Users.FirstOrDefault(u => u.username == username);
            if (user == null)
                return NotFound("User not found.");

            var role = _dbContext.UserRoles.FirstOrDefault(r => r.id == user.role_id)?.role_name;
            if (string.IsNullOrEmpty(role))
                return Forbid("User role not found.");

            if (role is "admin" or "Sales Manager" or "RF Manager" or "Support Manager" or "rf" or "support" or "dsp")
            {
                return Ok(_dbContext.Clients.ToList());
            }

            var clients = _dbContext.Clients
                .Where(c => (c.created_by != null && c.created_by == user.id) ||
                            (!string.IsNullOrEmpty(c.sales_exec) && c.sales_exec.ToLower() == username.ToLower()))
                .ToList();

            return Ok(clients);
        }

        [HttpGet("by-created/{userId}")]
        [Authorize]
        public IActionResult GetClientsByCreated(int userId)
        {
            var clients = _dbContext.Clients.Where(c => c.created_by == userId).ToList();
            return Ok(clients);
        }

        [HttpGet("by-reference-id/{referenceId}")]
        [Authorize]
        public IActionResult GetClientByReferenceId(string referenceId)
        {
            var client = _dbContext.Clients.FirstOrDefault(c => c.reference_id == referenceId);
            if (client == null)
                return NotFound("Client not found.");

            return Ok(client);
        }

        [HttpPut("{id}")]
        [Authorize]
        public IActionResult UpdateClient(int id, [FromBody] Client? updatedClient)
        {
            if (updatedClient == null)
                return BadRequest("Client data is required.");

            var username = User?.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized();

            var user = _dbContext.Users.FirstOrDefault(u => u.username == username);
            if (user == null)
                return Unauthorized();

            var role = _dbContext.UserRoles.FirstOrDefault(r => r.id == user.role_id)?.role_name;
            if (string.IsNullOrEmpty(role))
                return Forbid("User role not found.");

            Client? existingClient = role switch
            {
                "admin" or "Sales Manager" => _dbContext.Clients.FirstOrDefault(c => c.id == id),
                "sales" => _dbContext.Clients.FirstOrDefault(c => c.id == id && c.sales_exec == username),
                _ => null
            };

            if (existingClient == null)
                return NotFound("Client not found or not authorized.");

            // Update safely
            existingClient.reference_id = updatedClient.reference_id ?? existingClient.reference_id;
            existingClient.first_name = updatedClient.first_name ?? existingClient.first_name;
            existingClient.last_name = updatedClient.last_name ?? existingClient.last_name;
            existingClient.mobile = updatedClient.mobile ?? existingClient.mobile;
            existingClient.email = updatedClient.email ?? existingClient.email;
            existingClient.gender = updatedClient.gender ?? existingClient.gender;
            existingClient.dob = updatedClient.dob ?? existingClient.dob;
            existingClient.address = updatedClient.address ?? existingClient.address;
            existingClient.street = updatedClient.street ?? existingClient.street;
            existingClient.city = updatedClient.city ?? existingClient.city;
            existingClient.state = updatedClient.state ?? existingClient.state;
            existingClient.pincode = updatedClient.pincode ?? existingClient.pincode;
            existingClient.ip_address = updatedClient.ip_address ?? existingClient.ip_address;
            existingClient.created_by = updatedClient.created_by ?? existingClient.created_by;
            existingClient.connection_type = updatedClient.connection_type ?? existingClient.connection_type;
            existingClient.mac_id = updatedClient.mac_id ?? existingClient.mac_id;
            existingClient.service_type = updatedClient.service_type ?? existingClient.service_type;
            existingClient.package_type = updatedClient.package_type ?? existingClient.package_type;
            existingClient.business_type = updatedClient.business_type ?? existingClient.business_type;
            existingClient.registration_date = updatedClient.registration_date ?? existingClient.registration_date;
            existingClient.sales_exec = updatedClient.sales_exec ?? existingClient.sales_exec;
            existingClient.pppoe_user = updatedClient.pppoe_user ?? existingClient.pppoe_user;
            existingClient.pppoe_pass = updatedClient.pppoe_pass ?? existingClient.pppoe_pass;
            existingClient.installed_by = updatedClient.installed_by ?? existingClient.installed_by;

            _dbContext.SaveChanges();
            return Ok("Client updated successfully");
        }
    }
}
