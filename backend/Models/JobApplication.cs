using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class JobApplication
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int JobId { get; set; }
    [ForeignKey("JobId")]
    public Job Job { get; set; }

    [Required]
    public string UserId { get; set; }
    [ForeignKey("UserId")]
    public User User { get; set; }

    [Required]
    public DateTime ApplicationDate { get; set; } = DateTime.UtcNow;

    [Required]
    [StringLength(50)]
    public string Status { get; set; } = "Pending";
    
    [StringLength(2000)]
    public string? CoverLetter { get; set; }

    [StringLength(500)]
    public string? ResumeUrl { get; set; }
}