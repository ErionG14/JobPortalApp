using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Notification
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } // CRITICAL: Must be 'string'
    [ForeignKey("UserId")]
    public User User { get; set; } // <--- CRITICAL CHANGE: Must be 'User' to match your Identity setup

    public int? JobId { get; set; } // Optional: Link to a specific job if the notification is job-related
    [ForeignKey("JobId")]
    public Job? Job { get; set; } // Navigation property (nullable)

    [Required]
    [StringLength(500)] // Message content for the notification
    public string Message { get; set; }

    [Required]
    [StringLength(100)] // Type of notification (e.g., "JobApplicationConfirmation", "SystemAlert", "Message")
    public string Type { get; set; }

    [Required]
    public bool IsRead { get; set; } = false; // Whether the user has seen/read the notification

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}