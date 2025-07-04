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
public class JobController : ControllerBase
{
   private readonly ApplicationDbContext _context;
    private readonly ILogger<JobController> _logger;
    private readonly UserManager<User> _userManager; 

    public JobController(ApplicationDbContext context, ILogger<JobController> logger, UserManager<User> userManager)
    {
        _context = context;
        _logger = logger;
        _userManager = userManager;
    }

    
    [HttpPost("CreateJob")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Manager")]
    public async Task<IActionResult> CreateJob([FromBody] JobDTO model)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("CreateJob: Invalid ModelState for JobDTO. Errors: {Errors}", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            return BadRequest(ModelState);
        }

        var managerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(managerId))
        {
            _logger.LogError("CreateJob: Manager ID not found in token for authenticated request.");
            return Unauthorized(new { Message = "Manager ID not found in token." });
        }

        var manager = await _userManager.FindByIdAsync(managerId);
        if (manager == null)
        {
            _logger.LogError("CreateJob: Authenticated manager with ID {ManagerId} not found in database.", managerId);
            return NotFound(new { Message = "Authenticated manager not found." });
        }
        
        var job = new Job
        {
            Title = model.Title,
            Description = model.Description,
            Location = model.Location,
            EmploymentType = model.EmploymentType,
            SalaryMin = model.SalaryMin,
            SalaryMax = model.SalaryMax,
            CompanyName = model.CompanyName,
            ApplicationDeadline = model.ApplicationDeadline,
            UserId = managerId,
            PostedDate = DateTime.UtcNow,

        };

        _context.Jobs.Add(job);
        await _context.SaveChangesAsync();

        _logger.LogInformation("CreateJob: Job '{JobTitle}' created successfully by manager {ManagerId}. Job ID: {JobId}", job.Title, managerId, job.Id);

        return Ok(new { Message = "Job created successfully!", JobId = job.Id });
    }

    [HttpGet("GetJob{id}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Manager")]
    public async Task<IActionResult> GetJobById(int id)
    {
        var job = await _context.Jobs
            .Include(j => j.User)
            .FirstOrDefaultAsync(j => j.Id == id);

        if (job == null)
        {
            _logger.LogWarning("GetJobById: Job with ID {JobId} not found.", id);
            return NotFound(new { Message = $"Job with ID {id} not found." });
        }

        return Ok(new
        {
            job.Id,
            job.Title,
            job.Description,
            job.Location,
            job.EmploymentType,
            job.SalaryMin,
            job.SalaryMax,
            job.CompanyName,
            job.PostedDate,
            job.ApplicationDeadline,
            UserId = job.UserId,
            UserName = job.User?.UserName,
            UserFirstName = job.User?.Name,
            UserLastName = job.User?.Surname,
        });
    }
    
    [HttpGet("GetAllJobs")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Manager, User")]
    public async Task<IActionResult> GetAllJobs()
    {
        var jobs = await _context.Jobs
            .Include(j => j.User)
            .OrderByDescending(j => j.PostedDate) 
            .Select(j => new 
            {
                j.Id,
                j.Title,
                j.Description,
                j.Location,
                j.EmploymentType,
                j.SalaryMin,
                j.SalaryMax,
                j.CompanyName,
                j.PostedDate,
                j.ApplicationDeadline,
                ManagerId = j.UserId,
                ManagerUserName = j.User.UserName,
                ManagerFirstName = j.User.Name,
                ManagerLastName = j.User.Surname,
                ManagerImage = j.User.Image
            })
            .ToListAsync();

        _logger.LogInformation("GetAllJobs: Retrieved {Count} jobs.", jobs.Count);
        return Ok(jobs);
    }
    
   [HttpGet("GetMyPostedJobs")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Manager")]
    public async Task<IActionResult> GetMyPostedJobs()
    {
        var managerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(managerId))
        {
            _logger.LogError("GetMyPostedJobs: Manager ID not found in token for authenticated request.");
            return Unauthorized(new { Message = "Manager ID not found in token." });
        }

        var jobs = await _context.Jobs
                                 .Where(j => j.UserId == managerId)
                                 .Include(j => j.User)
                                 .OrderByDescending(j => j.PostedDate)
                                 .Select(j => new JobDisplayDTO
                                 {
                                     Id = j.Id,
                                     Title = j.Title,
                                     Description = j.Description,
                                     Location = j.Location,
                                     EmploymentType = j.EmploymentType,
                                     SalaryMin = j.SalaryMin,
                                     SalaryMax = j.SalaryMax,
                                     CompanyName = j.CompanyName,
                                     PostedDate = j.PostedDate,
                                     ApplicationDeadline = j.ApplicationDeadline,
                                     ManagerId = j.UserId,
                                     ManagerUserName = j.User.UserName,
                                     ManagerName = j.User.Name,
                                     ManagerSurname = j.User.Surname,
                                     ManagerImage = j.User.Image
                                 })
                                 .ToListAsync();

        _logger.LogInformation("GetMyPostedJobs: Retrieved {Count} jobs for manager {ManagerId}.", jobs.Count, managerId);
        return Ok(jobs);
    }

    [HttpPut("UpdateJob{id}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Manager")]
    public async Task<IActionResult> UpdateJob(int id, [FromBody] JobDTO model)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("UpdateJob: Invalid ModelState for JobDTO. Errors: {Errors}", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            return BadRequest(ModelState);
        }

        var job = await _context.Jobs.FindAsync(id);
        if (job == null)
        {
            _logger.LogWarning("UpdateJob: Job with ID {JobId} not found.", id);
            return NotFound(new { Message = $"Job with ID {id} not found." });
        }

        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (currentUserId == null || (job.UserId != currentUserId && !User.IsInRole("Admin")))
        {
            _logger.LogWarning("UpdateJob: User {AttemptingUserId} attempted to update job {JobId} but is not owner or Admin.", currentUserId, id);
            return StatusCode(403, new { Message = "You are not authorized to update this job." });
        }

        job.Title = model.Title;
        job.Description = model.Description;
        job.Location = model.Location;
        job.EmploymentType = model.EmploymentType;
        job.SalaryMin = model.SalaryMin;
        job.SalaryMax = model.SalaryMax;
        job.CompanyName = model.CompanyName;
        job.ApplicationDeadline = model.ApplicationDeadline;
        job.PostedDate = DateTime.UtcNow;

        _context.Entry(job).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        _logger.LogInformation("UpdateJob: Job {JobId} updated successfully by user {UpdaterUserId}.", id, currentUserId);
        return Ok(new { Message = $"Job with ID {id} updated successfully." });
    }
    
    [HttpDelete("DeleteJob{id}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Manager")]
    public async Task<IActionResult> DeleteJob(int id)
    {
        var job = await _context.Jobs.FindAsync(id);
        if (job == null)
        {
            _logger.LogWarning("DeleteJob: Job with ID {JobId} not found.", id);
            return NotFound(new { Message = $"Job with ID {id} not found." });
        }

        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (currentUserId == null || (job.UserId != currentUserId && !User.IsInRole("Admin")))
        {
            _logger.LogWarning("DeleteJob: User {AttemptingUserId} attempted to delete job {JobId} but is not owner or Admin.", currentUserId, id);
            return StatusCode(403, new { Message = "You are not authorized to delete this job." });
        }

        _context.Jobs.Remove(job);
        await _context.SaveChangesAsync();

        _logger.LogInformation("DeleteJob: Job {JobId} deleted successfully by user {DeleterUserId}.", id, currentUserId);
        return Ok(new { Message = $"Job with ID {id} deleted successfully." });
    }
}