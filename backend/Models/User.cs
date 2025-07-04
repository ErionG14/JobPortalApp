using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // Ensure this is present if you use [Column], otherwise often not strictly needed for basic properties
using Microsoft.AspNetCore.Identity;
// using Newtonsoft.Json; // Not needed if you are using System.Text.Json, which is default in .NET 8
using backend.Enums;

namespace backend.Models;

public class User : IdentityUser 
{
    [Required]
    [StringLength(8, ErrorMessage = "First name cannot be longer than 8 characters.")]
    public string Name { get; set; }
    
    [Required]
    [StringLength(10, ErrorMessage = "Last name cannot be longer than 10 characters.")]
    public string Surname { get; set; }
    
    [StringLength(20, ErrorMessage = "Address cannot be longer than 20 characters.")]
    public string Address { get; set; }
    
    public DateTime? Birthdate { get; set; }
    
    public string? Gender { get; set; }
   
    [RegularExpression(@"^\+?\d{1,3}[- ]?\d{3,14}$", ErrorMessage = "Invalid phone number format")]
    public string? Phone { get; set; }
    
    public string? Image { get; set; }
    
    public Roles Role { get; set; }
    
    public string? RefreshToken { get; set; }
    
   public ICollection<Post> Posts { get; set; }
   
   public ICollection<Job> Jobs { get; set; }
}