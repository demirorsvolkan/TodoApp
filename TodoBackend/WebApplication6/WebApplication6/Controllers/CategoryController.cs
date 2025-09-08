using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WebApplication6.Dto;
using WebApplication6.Entity;
using WebApplication6.Services;

namespace WebApplication6.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryServices _services;
        private readonly UserManager<ApplicationUser> _userManager;

        public CategoryController(ICategoryServices services, UserManager<ApplicationUser> userManager)
        {
            _services = services;
            _userManager = userManager;
        }
        [HttpGet("get/{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            var category = await _services.GetCategory(id, userId);
            if (category != null) { 
                return Ok(category);
            }
            return BadRequest();
        }
        [HttpPost("add")]
        public async Task<ActionResult<CategoryDto>> AddCategory([FromBody] CategoryDto categoryDto)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            var created =await _services.AddCategory(categoryDto, userId);
            if (created != null) {
                return Ok(created);
            }
            return BadRequest();
        }
        [HttpDelete("delete/{id}")]
        public ActionResult DeleteCategory(int id) 
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            _services.DeleteCategory(id,userId);
            return Ok(new { success = true, message = "Subtask başarıyla silindi." });
        }
        [HttpPut("update")]
        public async Task<ActionResult<CategoryDto>> UpdateCtegory([FromBody] CategoryDto categoryDto)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            var category = await _services.UpdateCategory(categoryDto, userId);
            if (category != null) 
            {
                return Ok(category);
            }
            return BadRequest();
        }
        [HttpPut("reorder/{id}")]
        public async Task<ActionResult> ReOrderCategory([FromQuery] int newOrder, int id)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            await _services.ReorderCategory(userId, id, newOrder);
            return Ok(new { success = true, message = "Yer değiştirildi." });
        }
        [HttpGet("list")]
        public async Task<ActionResult<List<CategoryDto>>> ListCategory()
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            return Ok(await _services.ListCategories(userId));
        }
    }
}
