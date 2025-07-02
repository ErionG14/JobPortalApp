using System.ComponentModel.DataAnnotations;

namespace backend.DTO;

public class PostDTO
{
    [Required(ErrorMessage = "Description is required.")]
    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
    public string Description { get; set; }
    
    public string? ImageUrl { get; set; }
}