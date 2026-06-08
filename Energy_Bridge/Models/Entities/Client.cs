using System;
using System.ComponentModel.DataAnnotations.Schema; // ✅ Add this

namespace Energy_Bridge.Models.Entities
{
    public class Client
    {
        public int id { get; set; }
        public string reference_id { get; set; }
        public string? first_name { get; set; }
        public string? last_name { get; set; }
        public string? mobile { get; set; }
        public string? email { get; set; }
        public string? gender { get; set; }
        public DateTime? dob { get; set; }
        public string? address { get; set; }
        public string? street { get; set; }
        public string? city { get; set; }
        public string? state { get; set; }
        public string? pincode { get; set; }
        public string? ip_address { get; set; }
        public int? created_by { get; set; }
        public string? connection_type { get; set; }
        public string? mac_id { get; set; }
        public string? service_type { get; set; }
        public string? package_type { get; set; }

      
        public string? business_type { get; set; } 

        public DateTime? registration_date { get; set; }
        public string? sales_exec { get; set; }
        public string? pppoe_user { get; set; }
        public string? pppoe_pass { get; set; }
        public string? installed_by { get; set; }
    }
}
