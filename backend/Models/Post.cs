using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Post
{
   [Key]
   public int Id { get; set; }
   
   [Required]
   [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
   public string Description { get; set; }
   
   public string? ImageUrl { get; set; }
   
   [Required]
   public DateTime CreatedAt { get; set; } = DateTime.Now;
   
   [Required]
   public DateTime UpdatedAt { get; set; }  = DateTime.Now;
   
   [ForeignKey("User")]
   public string UserId { get; set; }
   
   public User User { get; set; }
}