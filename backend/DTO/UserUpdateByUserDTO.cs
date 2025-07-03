using System.ComponentModel.DataAnnotations;

namespace backend.DTO;

public class UserUpdateByUserDTO
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    
    [StringLength(50, ErrorMessage = "The Username must be at least {2} and at max {1} characters long.", MinimumLength = 3)]
    public string Username { get; set; }

    public string Name { get; set; }

    public string Surname { get; set; }

    public string Address { get; set; }
    
    [DataType(DataType.Date)]
    public DateTime? Birthdate { get; set; }

    public string Gender { get; set; }

    public string PhoneNumber { get; set; }
}