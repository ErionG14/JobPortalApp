namespace backend.DTO;

public class PostDisplayDTO
{
    public int Id { get; set; }
    public string Description { get; set; }
    public string? ImageUrl { get; set; } // This is the URL for the post's image
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; } // Added for consistency, if you need it on display

    // Properties for the User who created the post
    public string UserId { get; set; }
    public string UserName { get; set; }
    public string Name { get; set; }
    public string Surname { get; set; }
    public string? Image { get; set; }
}