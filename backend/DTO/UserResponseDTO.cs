using backend.Enums;

namespace backend.DTO;

public class UserResponseDTO
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string? Address { get; set; }
    public DateTime? Birthdate { get; set; }
    public string? Gender { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Image { get; set; }
    public Roles Role { get; set; } 
}