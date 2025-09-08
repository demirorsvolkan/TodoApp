using DocumentFormat.OpenXml.Office2010.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Threading.Tasks;
using WebApplication6.Data;
using WebApplication6.Dto;
using WebApplication6.Entity;
using WebApplication6.Services;

namespace WebApplication6.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly ITaskServices _taskServices;
        private readonly ISubTaskServices _subTaskServices;
        private readonly ICategoryServices _categoryServices;
        private readonly IFileServices _fileServices;
        private readonly UserManager<ApplicationUser> _userManager;

        public TaskController(ITaskServices taskServices, UserManager<ApplicationUser> userManager, IFileServices fileServices, ISubTaskServices subTaskServices, ICategoryServices categoryServices)
        {
            _taskServices = taskServices;
            _categoryServices = categoryServices;
            _userManager = userManager;
            _fileServices = fileServices;
            _subTaskServices = subTaskServices;
        }
        [HttpGet("verify")]
        public async Task<ActionResult> Verify()
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return Unauthorized();
            }

            var userDto = new ApplicationUserDto
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                UserName=user.UserName,
                BirthDay = user.BirthDay,
                CreatedDate = user.CreatedDate
            };

            return Ok(userDto);
        }
        [HttpGet("template")]
        public IActionResult GetTemplate(){
            byte[] template = _fileServices.CreateTemplate();
            string name ="TaskTemplate.xlsx";
            string type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            return File(template, type, name);
        }
        [HttpGet("listWithFile/{id}/{withSub}")]
        public async Task<IActionResult> GetTaskListFile(int id, bool withSub)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            var category=(await _categoryServices.GetCategory(id,userId)).CategoryName;
            var list =await _taskServices.ListTasks(id, userId);
            byte[] list_file = { };
            if (list.Count != 0)
            {
                list_file = await _fileServices.GetTaskListFileAsync(list.OfType<IResponse>().ToList(), null, userId, withSub);
                string name = $"{category} TaskList.xlsx";
                string type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                return File(list_file, type, name);
            }
            else
            {
                return NotFound();
            }
           
        }
        [HttpPost("check/{id}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<Dictionary<int, List<int>>>> CheckFile([FromForm]FileUploadDto model, int id) 
        {
            var file = model.File;
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            using var reader = new BinaryReader(file.OpenReadStream());
            var headerBytes = reader.ReadBytes(4);

            if (ext != ".xlsx" || !headerBytes.SequenceEqual(new byte[] { 0x50, 0x4B, 0x03, 0x04 }))
                return BadRequest("Geçersiz dosya türü veya içeriği.");


            var dict = _fileServices.CheckFile(file);
            if (dict.Count() == 0)
            {
                var list = _fileServices.ReadFile(file, null, id).OfType<TaskDto>().ToList();
                if (list != null && list.Count()!=0)
                {
                    int count = await _taskServices.AddTaskList(list, userId);
                    dict[0] = new List<int> { count, 200, 200, 200,200};        
                }
            }
            return dict;
        }
        [HttpPost("upload_force/{id}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<int>> UploadFile([FromForm] FileUploadDto model, int id)
        {
            var file = model.File;
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            using var reader = new BinaryReader(file.OpenReadStream());
            var headerBytes = reader.ReadBytes(4);

            if (ext != ".xlsx" || !headerBytes.SequenceEqual(new byte[] { 0x50, 0x4B, 0x03, 0x04 }))
                return BadRequest("Geçersiz dosya türü veya içeriği.");

            var dict = _fileServices.CheckFile(file);
            if (dict.Keys.ToList().Contains(1))
            {
                return BadRequest(-1);
            }
            else
            {
                var list = _fileServices.ReadFile(file, null, id).OfType<TaskDto>().ToList(); ;
                if (list != null)
                {
                    int count = await _taskServices.AddTaskList(list, userId);
                    return Ok(count);
                }
                else
                {
                    return NotFound(-1);
                }
            }
        }


        [HttpGet("get/{id}")]
        public async Task<ActionResult<TaskDto>> GetTask(int id) {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            return Ok(await _taskServices.GetTask(id, userId));
        }
        [HttpPost("add")]
        public async Task<ActionResult<TaskDto>> AddTask([FromBody] TaskDto taskDto)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var createdTaskDto =await _taskServices.AddTask(taskDto, userId);

            return Ok(createdTaskDto);
        }


        [HttpDelete("delete/{id}")]
        public ActionResult DeleteTask(int id) {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            _taskServices.DeleteTask(id, userId);
            return Ok(new { success = true, message = "Subtask başarıyla silindi." });
        }
        [HttpPut("update")]
        public async Task<ActionResult<TaskDto>> UpdateTask([FromBody] TaskDto taskDto) {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var task = await _taskServices.UpdateTask(taskDto, userId);
            return Ok(task);
        }
        [HttpPut("reorder/{id}")]
        public async Task<ActionResult> ReOrderTask([FromQuery] int newOrder, int id)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            await _taskServices.ReorderTask(userId, id, newOrder);
            return Ok(new { success = true, message = "Yer değiştirildi." });
        }

        [HttpGet("list/{id}")]
        public async Task<ActionResult<List<TaskDto>>> ListTasks(int id)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            return Ok(await _taskServices.ListTasks(id, userId));
        }
    }
}
