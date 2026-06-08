namespace Energy_Bridge.Models.Entities
{
    public class User
    {
        public int id { get; set; }
        public required string username { get; set; }
        public required string password { get; set; }
        public string? plain_password { get; set; }

        public int? role_id { get; set; }
        public string? status { get; set; }
        public bool isLogged { get; set; } = false;  

        // Permissions JSON stored as string
        public string? Permissions { get; set; }  
    }
}
