using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class JobApplication
{
    [Key]
    public int Id { get; set; }

    [Required] // Good practice for clarity, though int is non-nullable by default
    public int JobId { get; set; } // Foreign key to the Job
    [ForeignKey("JobId")]
    public Job Job { get; set; } // Navigation property

    [Required] // <--- IMPORTANT: Add [Required] for string foreign keys
    public string UserId { get; set; } // <--- CRITICAL CHANGE: Must be 'string'
    [ForeignKey("UserId")]
    public User User { get; set; } // <--- CRITICAL CHANGE: Must be 'ApplicationUser'

    [Required]
    public DateTime ApplicationDate { get; set; } = DateTime.UtcNow; // When the application was submitted

    [Required]
    [StringLength(50)]
    public string Status { get; set; } = "Pending"; // Default status
    
    [StringLength(2000)] // Example max length for a cover letter
    public string? CoverLetter { get; set; } // Nullable if not always required

    [StringLength(500)] // Example max length for a URL
    public string? ResumeUrl { get; set; }
}