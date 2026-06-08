namespace Energy_Bridge.Models.Entities
{
    public class Package
    {
        public int id { get; set; }
        public string service_type { get; set; }
        public string package_name { get; set; }

        public string? bandwidth { get; set; }

        public decimal? price { get; set; }

        public string? notes  {get;set;}
    }
}