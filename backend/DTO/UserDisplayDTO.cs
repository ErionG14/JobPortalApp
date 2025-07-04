using backend.Enums;

namespace backend.DTO;

public class UserDisplayDTO
{
    public string Id { get; set; }
    public string UserName { get; set; }
    public string Email { get; set; }
    public string Name { get; set; } // Corresponds to your User.Name
    public string Surname { get; set; } // Corresponds to your User.Surname
    public string? Address { get; set; }
    public DateTime? Birthdate { get; set; }
    public string? Gender { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Image { get; set; }
    
    // This is the crucial property for the role check on the frontend
    public Roles Role { get; set; } // Will hold the string representation of the enum (e.g., "Manager", "User")
}