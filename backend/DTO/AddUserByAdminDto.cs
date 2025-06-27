using System.ComponentModel.DataAnnotations;
using backend.Enums;

namespace backend.DTO;

public class AddUserByAdminDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
    public string Password { get; set; } // No ConfirmPassword needed for admin creation

    [Required]
    [StringLength(50, ErrorMessage = "The Username must be at least {2} and at max {1} characters long.", MinimumLength = 3)]
    public string Username { get; set; }

    [Required]
    public string Name { get; set; }

    [Required]
    public string Surname { get; set; }

    public string? Address { get; set; }

    [DataType(DataType.Date)]
    public DateTime? Birthdate { get; set; }

    public string? Gender { get; set; }

    public string? PhoneNumber { get; set; }

    [Required]
    public Roles Role { get; set; }
}