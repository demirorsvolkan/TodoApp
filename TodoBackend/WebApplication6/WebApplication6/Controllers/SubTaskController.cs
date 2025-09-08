using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WebApplication6.Dto;
using WebApplication6.Services;

namespace WebApplication6.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SubTaskController : ControllerBase
    {
        private readonly ISubTaskServices _subTaskServices;
        private readonly ITaskServices _taskServices;
        private readonly IFileServices _fileServices;
        public SubTaskController(ISubTaskServices subTaskServices,ITaskServices taskServices, IFileServices fileServices)
        {
            _subTaskServices = subTaskServices;
            _taskServices = taskServices;
            _fileServices = fileServices;
        }


        [HttpGet("template")]
        public IActionResult GetTemplate()
        {
            byte[] template = _fileServices.CreateTemplate();
            string name = "TaskTemplate.xlsx";
            string type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            return File(template, type, name);
        }

        [HttpGet("listWithFile/{id}")]
        public async Task<IActionResult> GetTaskListFile(int id)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            var list = await _subTaskServices.ListTasks(id,userId);
            if (list.Count != 0)
            {
                var mainTask = await _taskServices.GetTask(list[0].MainTaskId, userId);
                byte[] list_file =await _fileServices.GetTaskListFileAsync(list.OfType<IResponse>().ToList(), mainTask, userId, false);
                string name = "TaskList.xlsx";
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
        public async Task<ActionResult<Dictionary<int, List<int>>>> CheckFile([FromForm] FileUploadDto model, int id)
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
                var list = _fileServices.ReadFile(file, id, null).OfType<SubTaskDto>().ToList();
                if (list != null && list.Count() != 0)
                {
                    int count = await _subTaskServices.AddTaskList(list, userId);
                    dict[0] = new List<int> { count, 200, 200, 200, 200};
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
                var list = _fileServices.ReadFile(file, id, null).OfType<SubTaskDto>().ToList(); ;
                if (list != null)
                {
                    int count = await _subTaskServices.AddTaskList(list, userId);
                    return Ok(count);
                }
                else
                {
                    return NotFound(-1);
                }
            }
        }





        [HttpGet("get/{id}")]
        public async Task<ActionResult<SubTaskDto>> GetTask(int id)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            var subTask =await _subTaskServices.GetTask(id, userId);
            if (subTask != null) {
                return Ok(subTask);
            }
            return BadRequest();
        }
        [HttpPost("add")]
        public async Task<ActionResult<SubTaskDto>> AddTask([FromBody] SubTaskDto taskDto)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var createdSubTaskDto = await _subTaskServices.AddTask(taskDto, userId);

            return Ok(createdSubTaskDto);
        }


        [HttpDelete("delete/{id}")]
        public ActionResult DeleteTask(int id)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            _subTaskServices.DeleteTask(id, userId);
            return Ok(new { success = true, message = "Subtask başarıyla silindi." });
        }
        [HttpPut("update")]
        public async Task<ActionResult<SubTaskDto>> UpdateTask([FromBody] SubTaskDto taskDto)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            var subTask = await _subTaskServices.UpdateTask(taskDto, userId);
            return Ok(subTask);
        }
        [HttpPut("reorder/{id}")]
        public async Task<ActionResult> ReOrderSubTask([FromQuery] int newOrder, int id)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            await _subTaskServices.ReorderTask(userId, id, newOrder);
            return Ok(new { success = true, message = "Yer değiştirildi." });
        }
        [HttpGet("list/{id}")]
        public async Task<ActionResult<List<SubTaskDto>>> ListTasks( int id)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            return Ok(await _subTaskServices.ListTasks(id, userId));
        }
    }
}
