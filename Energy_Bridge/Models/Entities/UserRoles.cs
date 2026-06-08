namespace Energy_Bridge.Models.Entities;
public class UserRoles
{
    public int id { get; set; }

    public required string role_name { get; set; }

    public string? Permissions { get; set; }
}
