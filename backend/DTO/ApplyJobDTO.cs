using System.ComponentModel.DataAnnotations;

namespace backend.DTO;

public class ApplyJobDTO
{
    [StringLength(1000)]
     public string? CoverLetter { get; set; }
     
     public string? ResumeUrl { get; set; }
}