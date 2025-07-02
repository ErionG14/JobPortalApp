using System.Security.Claims;
using backend.DBContext;
using backend.DTO;
using backend.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostController : ControllerBase
{
    private readonly ApplicationDbContext  _context;
    private readonly ILogger<PostController> _logger;
    
    public PostController(ApplicationDbContext context, ILogger<PostController> logger)
    {
        _context = context;
        _logger = logger;
    }
    
   [HttpPost("CreatePost")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "User,Manager")]
    public async Task<IActionResult> CreatePost([FromBody]PostDTO model)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("CreatePost: Invalid ModelState for PostDTO. Errors: {Errors}", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            return BadRequest(ModelState);
        }
        
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogError("CreatePost: User ID not found in token or associated user not found in DB.");
            return Unauthorized(new { Message = "User not identified or found." });
        }
        
        var existingUser = await _context.Users.FindAsync(userId);
        if (existingUser == null)
        {
            _logger.LogError("CreatePost: Authenticated user with ID {UserId} not found in database.", userId);
            return Unauthorized(new { Message = "Authenticated user not found in database." });
        }
        
        var post = new Post
        {
            Description = model.Description,
            ImageUrl = model.ImageUrl,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow 
        };
        
        _context.Posts.Add(post);
        await _context.SaveChangesAsync();

        _logger.LogInformation("CreatePost: Post created successfully by user {UserId}. Post ID: {PostId}", userId, post.Id);
        
        return Ok(new { Message = "Post created successfully!", PostId = post.Id });
    }
    
    [HttpGet("GetPost{id}")] 
    [AllowAnonymous] 
    public async Task<IActionResult> GetPostById(int id)
    {
        var post = await _context.Posts
                                 .Include(p => p.User)
                                 .FirstOrDefaultAsync(p => p.Id == id);

        if (post == null)
        {
            _logger.LogWarning("GetPostById: Post with ID {PostId} not found.", id);
            return NotFound(new { Message = $"Post with ID {id} not found." });
        }

        return Ok(new
        {
            post.Id,
            post.Description,
            post.ImageUrl,
            post.CreatedAt,
            post.UpdatedAt,
            UserId = post.UserId,
            UserName = post.User?.UserName,
            UserFirstName = post.User?.Name,
            UserLastName = post.User?.Surname,
        });
    }
    
    [HttpGet("GetAllPosts")] 
    [AllowAnonymous]
    public async Task<IActionResult> GetAllPosts()
    {
        var posts = await _context.Posts
                                  .Include(p => p.User)
                                  .OrderByDescending(p => p.CreatedAt)
                                  .Select(p => new
                                  {
                                      p.Id,
                                      p.Description,
                                      p.ImageUrl,
                                      p.CreatedAt,
                                      p.UpdatedAt,
                                      UserId = p.UserId,
                                      UserName = p.User.UserName,
                                      UserFirstName = p.User.Name,
                                      UserLastName = p.User.Surname
                                  })
                                  .ToListAsync();

        _logger.LogInformation("GetAllPosts: Retrieved {Count} posts.", posts.Count);
        return Ok(posts);
    }
    
    [HttpPut("UpdatePost{id}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "User,Manager,Admin")] 
    public async Task<IActionResult> UpdatePost(int id, [FromBody] PostDTO model)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("UpdatePost: Invalid ModelState for PostDTO. Errors: {Errors}", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            return BadRequest(ModelState);
        }
        
        var post = await _context.Posts.FindAsync(id);
        if (post == null)
        {
            _logger.LogWarning("UpdatePost: Post with ID {PostId} not found.", id);
            return NotFound(new { Message = $"Post with ID {id} not found." });
        }
        
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        
        if (userId == null || (post.UserId != userId && !User.IsInRole("Admin")))
        {
            _logger.LogWarning("UpdatePost: User {AttemptingUserId} attempted to update post {PostId} but is not owner or Admin.", userId, id);
            return Forbid();
        }
        
        post.Description = model.Description;
        post.ImageUrl = model.ImageUrl;
        post.UpdatedAt = DateTime.UtcNow;
        
        _context.Entry(post).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        _logger.LogInformation("UpdatePost: Post {PostId} updated successfully by user {UserId}.", id, userId);
        return Ok(new { Message = $"Post with ID {id} updated successfully." });
    }
    
    [HttpDelete("DeletePost{id}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "User,Admin,Manager")]
    public async Task<IActionResult> DeletePost(int id)
    {
        var post = await _context.Posts.FindAsync(id);
        if (post == null)
        {
            _logger.LogWarning("DeletePost: Post with ID {PostId} not found.", id);
            return NotFound(new { Message = $"Post with ID {id} not found." });
        }
        
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (userId == null || (post.UserId != userId && !User.IsInRole("Admin")))
        {
            _logger.LogWarning("DeletePost: User {AttemptingUserId} attempted to delete post {PostId} but is not owner or Admin.", userId, id);
            return Forbid();
        }
        
        _context.Posts.Remove(post);
        await _context.SaveChangesAsync();

        _logger.LogInformation("DeletePost: Post {PostId} deleted successfully by user {UserId}.", id, userId);
        return Ok(new { Message = $"Post with ID {id} deleted successfully." });
    }
}