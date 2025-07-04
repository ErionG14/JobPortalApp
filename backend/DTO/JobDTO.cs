using System.ComponentModel.DataAnnotations;

namespace backend.DTO;

public class JobDTO
{
    [Required(ErrorMessage = "Job title is required.")]
    [StringLength(100, ErrorMessage = "Title cannot exceed 100 characters.")]
    public string Title { get; set; }
    
    [Required(ErrorMessage = "Job description is required.")]
    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
    public string Description { get; set; }
    
    [Required(ErrorMessage = "Location is required.")]
    [StringLength(100, ErrorMessage = "Location cannot exceed 100 characters.")]
    public string Location { get; set; }
    
    [Required(ErrorMessage = "Employment type is required.")]
    [StringLength(50, ErrorMessage = "Employment type cannot exceed 50 characters.")]
    public string EmploymentType { get; set; }
    
    [Range(0, 1000000, ErrorMessage = "Minimum salary must be between 0 and 1,000,000.")]
    public decimal? SalaryMin { get; set; }

    [Range(0, 1000000, ErrorMessage = "Maximum salary must be between 0 and 1,000,000.")]
    public decimal? SalaryMax { get; set; }
    
    [StringLength(255, ErrorMessage = "Company name cannot exceed 255 characters.")]
    public string CompanyName { get; set; }
    
    [DataType(DataType.Date)]
    public DateTime ApplicationDeadline { get; set; }
}