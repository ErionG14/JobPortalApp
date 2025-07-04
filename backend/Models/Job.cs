using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Job
{
   [Key]
   public int Id { get; set; }
   
   [Required]
   [StringLength(100)]
   public string Title { get; set; }
   
   [Required]
   [StringLength(500)]
   public string Description { get; set; }
   
   [Required]
   [StringLength(100)]
   public string Location { get; set; }
   
   [Required]
   [StringLength(50)]
   public string EmploymentType  { get; set; }
   
   [Column(TypeName = "decimal(18, 2)")]
   public decimal? SalaryMin { get; set; }

   [Column(TypeName = "decimal(18, 2)")]
   public decimal? SalaryMax { get; set; }
   
   [Required]
   [StringLength(255)]
   public string CompanyName { get; set; }
   
   public DateTime PostedDate { get; set; } =  DateTime.UtcNow;
   
   public DateTime ApplicationDeadline  { get; set; }
   
   [ForeignKey("User")]
   public string UserId { get; set; }
   
   public User User { get; set; }
}