namespace Energy_Bridge.Models.DTOs
{
    public class TicketWithClientDto
    {
        public int Id { get; set; }
        public string ClientId { get; set; } = string.Empty;
        public string ClientFirstName { get; set; } = string.Empty;
        public string ClientLastName { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int? AssignedTo { get; set; }
        public int? AssignedUser { get; set; }
        public string CallSource { get; set; } = string.Empty;
        public bool IsViewed { get; set; }
        public string ViewedBy { get; set; } = string.Empty;
    }
}
