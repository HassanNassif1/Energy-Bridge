using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Energy_Bridge.Models.Entities
{
    public class Ticket_Comments
    {
        public int id { get; set; }

        [ForeignKey("Ticket")]
        public int ticket_id { get; set; }

        public string author { get; set; } = string.Empty;

        public string comment { get; set; } = string.Empty;

        // Navigation property
        public Ticket? Ticket { get; set; }
         public DateTime created_at { get; set; } = DateTime.Now;
    }
}
