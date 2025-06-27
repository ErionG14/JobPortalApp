using backend.DTO;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;



public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly TokenService _tokenService;

    public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, TokenService tokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDTO model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = await _userManager.FindByEmailAsync(model.Email);

        if (user == null)
        {
            return Unauthorized(new { Message = "Invalid login attempt." });
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, lockoutOnFailure: false);

        if (result.Succeeded)
        {
            var token = await _tokenService.GenerateTokenAsync(user);
            return Ok(new { Token = token });
        }
        else
        {
            return Unauthorized(new { Message = "Invalid login attempt." });
        }
    }
}