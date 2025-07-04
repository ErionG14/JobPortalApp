using System.Security.Claims;
using backend.DBContext;
using backend.DTO;
using backend.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationController : ControllerBase
{
     private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly ILogger<NotificationController> _logger;

        public NotificationController(ApplicationDbContext context, UserManager<User> userManager, ILogger<NotificationController> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }

        [HttpGet("GetMyNotifications")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> GetMyNotifications()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogError("GetMyNotifications: User ID not found in token for authenticated request.");
                return Unauthorized(new { Message = "User ID not found in token." });
            }

            var notifications = await _context.Notifications
                                            .Where(n => n.UserId == userId)
                                            .OrderByDescending(n => n.CreatedAt)
                                            .Select(n => new NotificationDTO
                                            {
                                                Id = n.Id,
                                                Message = n.Message,
                                                Type = n.Type,
                                                IsRead = n.IsRead,
                                                CreatedAt = n.CreatedAt,
                                                JobId = n.JobId,
                                                JobTitle = n.Job != null ? n.Job.Title : null
                                            })
                                            .ToListAsync();

            _logger.LogInformation("GetMyNotifications: Retrieved {Count} notifications for user {UserId}.", notifications.Count, userId);
            return Ok(notifications);
        }

        [HttpPut("MarkAsRead/{notificationId}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> MarkNotificationAsRead(int notificationId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "User ID not found in token." });
            }

            var notification = await _context.Notifications.FindAsync(notificationId);

            if (notification == null)
            {
                return NotFound(new { Message = "Notification not found." });
            }

            if (notification.UserId != userId)
            {
                _logger.LogWarning("MarkNotificationAsRead: User {AttemptingUserId} attempted to mark notification {NotificationId} as read but is not the owner.", userId, notificationId);
                return StatusCode(403, new { Message = "You are not authorized to modify this notification." });
            }

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            _logger.LogInformation("MarkNotificationAsRead: Notification {NotificationId} marked as read for user {UserId}.", notificationId, userId);
            return Ok(new { Message = "Notification marked as read." });
        }
}