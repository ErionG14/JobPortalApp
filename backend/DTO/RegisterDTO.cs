using System.ComponentModel.DataAnnotations;

namespace backend.DTO;

public class RegisterDTO
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
    [DataType(DataType.Password)]
    public string Password { get; set; }

    [DataType(DataType.Password)]
    [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
    public string ConfirmPassword { get; set; }
    
    [Required]
    [StringLength(50, ErrorMessage = "The Username must be at least {2} and at max {1} characters long.", MinimumLength = 3)]
    public string Username { get; set; }

    [Required]
    [StringLength(8, ErrorMessage = "First name cannot be longer than 8 characters.")]
    public string Name { get; set; }

    [Required]
    [StringLength(10, ErrorMessage = "Last name cannot be longer than 10 characters.")]
    public string Surname { get; set; }

    [StringLength(20, ErrorMessage = "Address cannot be longer than 20 characters.")]
    public string Address { get; set; }

    [DataType(DataType.Date)]
    public DateTime? Birthdate { get; set; }

    public string? Gender { get; set; }

    [RegularExpression(@"^\+?\d{1,3}[- ]?\d{3,14}$", ErrorMessage = "Invalid phone number format")]
    public string? PhoneNumber { get; set; }
}