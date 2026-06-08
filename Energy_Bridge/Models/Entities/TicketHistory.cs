using System;
using System.ComponentModel.DataAnnotations;

namespace Energy_Bridge.Models.Entities
{
    public class TicketHistory
    {
        [Key]
        public int id { get; set; }

        public int? ticket_id { get; set; } // ✅ make nullable
        public string? client_id { get; set; }
        public string? subject { get; set; }
        public string? description { get; set; }
        public string? category { get; set; }
        public string? severity { get; set; }
        public string? status { get; set; }
        public int? assigned_to { get; set; }
        public string? call_source { get; set; }
        public string? notification { get; set; }

        public int? user_id { get; set; } // just the ID, no User

        public DateTime created_at { get; set; } = DateTime.Now;
        public bool isViewed { get; set; } = false;
        public string? viewedBy { get; set; }
        public int? assigned_user { get; set; } // ✅ NEW
    }
}
