using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
// using Newtonsoft.Json; // Not needed if you are using System.Text.Json, which is default in .NET 8
using backend.Enums; 

namespace backend.Models;

public class User : IdentityUser // Inheriting from IdentityUser is correct
{
    [Required] 
    [StringLength(20, ErrorMessage = "The name should be less than 20 characters.")]
    public string? Name { get; set; } 

    [Required] 
    [StringLength(10, ErrorMessage = "The surname should be less than 10 characters.")]
    public string? Surname { get; set; } 

    [StringLength(20, ErrorMessage = "The address should be less than 20 characters.")]
    public string? Address { get; set; } 

    

    public DateTime? Birthdate { get; set; } // Can be nullable

    public string? Gender { get; set; } // Can be nullable

    [RegularExpression(@"^\+?\d{1,3}[- ]?\d{3,14}$", ErrorMessage = "Invalid phone number format")]
    // Note: IdentityUser already has a PhoneNumber property. Similar to Email, consider using that.
    public string? Phone { get; set; } // Can be nullable

    public string? Image { get; set; } // Path/URL to user's profile image. Can be nullable

 
    public Roles Role { get; set; }

}