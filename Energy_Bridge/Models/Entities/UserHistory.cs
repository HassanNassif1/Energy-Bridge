namespace Energy_Bridge.Models.Entities
{
    public class UserHistory
    {
        public int id { get; set; }
        public required string username { get; set; }
        public required string password { get; set; }
        public int? role_id { get; set; }

        public string? status { get; set; }


            public bool isLogged { get; set; } = false;   
       
  public DateTime created_at { get; set; } = DateTime.UtcNow; // default to now
    }
}
