using backend.DTO;
using backend.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]

public class UserController : ControllerBase
{
  private readonly UserManager<User> _userManager;
  private readonly RoleManager<IdentityRole> _roleManager;

    public UserController(UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody]RegisterDTO model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = new User
        {
            UserName = model.Username,
            Email = model.Email,
            Name = model.Name,
            Surname = model.Surname,
            Address = model.Address,
            Birthdate = model.Birthdate,
            Gender = model.Gender,
            PhoneNumber = model.PhoneNumber
        };

        var result = await _userManager.CreateAsync(user, model.Password);

        if (result.Succeeded)
        {
            if (await _roleManager.RoleExistsAsync("User"))
            {
                await _userManager.AddToRoleAsync(user, "User");
            }
            else
            {
                ModelState.AddModelError(string.Empty, "The 'User' role does not exist.");
                return BadRequest(ModelState);
            }

            return Ok(new { Message = "Registration successful!" });
        }
        else
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
            return BadRequest(ModelState);
        }
    }

    [HttpPost("AddUser")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public async Task<IActionResult> AddUser(AddUserByAdminDto model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = new User
        {
            UserName = model.Username,
            Email = model.Email,
            Name = model.Name,
            Surname = model.Surname,
            Address = model.Address,
            Birthdate = model.Birthdate,
            Gender = model.Gender,
            PhoneNumber = model.PhoneNumber,
            Role = model.Role 
        };

        var result = await _userManager.CreateAsync(user, model.Password);

        if (result.Succeeded)
        {
            if (await _roleManager.RoleExistsAsync(model.Role.ToString()))
            {
                await _userManager.AddToRoleAsync(user, model.Role.ToString());
                return Ok(new { Message = $"User '{user.UserName}' created successfully with role '{model.Role}'." });
            }
            else
            {
                ModelState.AddModelError(string.Empty, $"The role '{model.Role}' does not exist.");
                return BadRequest(ModelState);
            }
        }
        else
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
            return BadRequest(ModelState);
        }
    }
    
    [HttpGet("GetAllUsers")] 
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public async Task<IActionResult> GetAllUsers()
    {
       
        var users = await _userManager.Users.ToListAsync();
        
        var userDtos = new List<UserResponseDTO>();
        foreach (var user in users)
        {
            var identityRoles = await _userManager.GetRolesAsync(user);

            userDtos.Add(new UserResponseDTO
            {
                Id = user.Id,
                Email = user.Email,
                UserName = user.UserName,
                Name = user.Name,
                Surname = user.Surname,
                Address = user.Address,
                Birthdate = user.Birthdate,
                Gender = user.Gender,
                PhoneNumber = user.PhoneNumber, 
                Image = user.Image,
                Role = user.Role 
            });
        }

        return Ok(userDtos);
    }
    
    // Read single user by ID (Admin only)
    [HttpGet("GetUser{id}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public async Task<IActionResult> GetUserById(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { Message = "User not found." });

        return Ok(user);
    }

    // Update user (Admin only)
    [HttpPut("UpdateUser{id}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public async Task<IActionResult> UpdateUser(string id, UserUpdateDto model)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { Message = "User not found." });

        // Update basic fields
        user.UserName = model.Username;
        user.Email = model.Email;
        user.Name = model.Name;
        user.Surname = model.Surname;
        user.Address = model.Address;
        user.Birthdate = model.Birthdate;
        user.Gender = model.Gender;
        user.PhoneNumber = model.PhoneNumber;
        user.Role = model.Role;

        // Update role
        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);
        if (await _roleManager.RoleExistsAsync(model.Role.ToString()))
        {
            await _userManager.AddToRoleAsync(user, model.Role.ToString());
        }

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
            return BadRequest(ModelState);
        }

        return Ok(new { Message = $"User '{user.UserName}' updated successfully." });
    }

    // Delete user (Admin only)
    [HttpDelete("DeleteUser{id}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { Message = "User not found." });

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
            return BadRequest(ModelState);
        }

        return Ok(new { Message = $"User '{user.UserName}' deleted successfully." });
    }
}