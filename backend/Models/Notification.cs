using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Notification
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; }
    [ForeignKey("UserId")]
    public User User { get; set; }

    public int? JobId { get; set; }
    [ForeignKey("JobId")]
    public Job? Job { get; set; }

    [Required]
    [StringLength(500)]
    public string Message { get; set; }

    [Required]
    [StringLength(100)]
    public string Type { get; set; }

    [Required]
    public bool IsRead { get; set; } = false;

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}