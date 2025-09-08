using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApplication6.Data;
using WebApplication6.Dto;
using WebApplication6.Entity;

namespace WebApplication6.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly JwtTokenService _jwtTokenService;

        public AuthController(UserManager<ApplicationUser> userManager,
                              SignInManager<ApplicationUser> signInManager,
                              IConfiguration configuration,
                              JwtTokenService jwtTokenService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _jwtTokenService = jwtTokenService;
        }


        [HttpGet("username-exists")]
        public async Task<IActionResult> UsernameExists([FromQuery] string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest("Username is required.");

            var user = await _userManager.FindByNameAsync(username);
            bool exists = user != null;
            return Ok(exists);
        }

        // Email kontrol endpoint
        [HttpGet("email-exists")]
        public async Task<IActionResult> EmailExists([FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest("Email is required.");

            var user = await _userManager.FindByEmailAsync(email);
            bool exists = user != null;
            return Ok(exists);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto model)
        {
            var user = new ApplicationUser
            {
                UserName = model.UserName,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                BirthDay = model.Birthday
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok("User registered");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto model)
        {
            ApplicationUser user = null;

            // Email format kontrolü direkt burada
            bool isEmail = false;
            try
            {
                var addr = new System.Net.Mail.MailAddress(model.UserName);
                isEmail = (addr.Address == model.UserName);
            }
            catch
            {
                isEmail = false;
            }

            if (isEmail)
            {
                user = await _userManager.FindByEmailAsync(model.UserName);
            }
            else
            {
                user = await _userManager.FindByNameAsync(model.UserName);
            }

            if (user == null)
                return Unauthorized();

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!result.Succeeded)
                return Unauthorized();

            var token = await _jwtTokenService.GenerateJwtToken(user);
            return Ok(new { token });
        }


    }
}
