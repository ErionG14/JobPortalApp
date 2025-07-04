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
public class JobApplicationController : ControllerBase
{
   private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly ILogger<JobApplicationController> _logger;

        public JobApplicationController(ApplicationDbContext context, UserManager<User> userManager, ILogger<JobApplicationController> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }

        [HttpPost("Apply/{jobId}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "User")] 
        public async Task<IActionResult> ApplyForJob(int jobId, [FromBody] ApplyJobDTO model)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("ApplyForJob: Invalid ModelState for ApplyJobDTO. Errors: {Errors}", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogError("ApplyForJob: User ID not found in token for authenticated request.");
                return Unauthorized(new { Message = "User ID not found in token." });
            }

            var job = await _context.Jobs
                                    .Include(j => j.User)
                                    .FirstOrDefaultAsync(j => j.Id == jobId);

            if (job == null)
            {
                _logger.LogWarning("ApplyForJob: Job with ID {JobId} not found.", jobId);
                return NotFound(new { Message = $"Job with ID {jobId} not found." });
            }

            
            if (User.IsInRole("Manager") || User.IsInRole("Admin"))
            {
                _logger.LogWarning("ApplyForJob: User {UserId} (Role: {Role}) attempted to apply for job {JobId}. Only 'User' role can apply.", userId, User.IsInRole("Manager") ? "Manager" : "Admin", jobId);
                return StatusCode(403, new { Message = "Managers and Admins cannot apply for jobs." });
            }

            
            var existingApplication = await _context.JobApplications
                                                    .AnyAsync(ja => ja.JobId == jobId && ja.UserId == userId);
            if (existingApplication)
            {
                _logger.LogWarning("ApplyForJob: User {UserId} has already applied for job {JobId}.", userId, jobId);
                return Conflict(new { Message = "You have already applied for this job." });
            }
            
            var jobApplication = new JobApplication
            {
                JobId = jobId,
                UserId = userId,
                ApplicationDate = DateTime.UtcNow,
                Status = "Pending",
                CoverLetter = model.CoverLetter,
                ResumeUrl = model.ResumeUrl
            };

            _context.JobApplications.Add(jobApplication);

            
            var notificationMessage = $"You successfully applied for '{job.Title}'. The application deadline is {job.ApplicationDeadline.ToShortDateString()}.";
            var notification = new Notification
            {
                UserId = userId,
                JobId = jobId,
                Message = notificationMessage,
                Type = "JobApplicationConfirmation",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();

            _logger.LogInformation("ApplyForJob: User {UserId} successfully applied for Job {JobId} and notification created.", userId, jobId);
            return Ok(new { Message = "Job application submitted successfully! You will receive a notification.", ApplicationId = jobApplication.Id });
        }
    }