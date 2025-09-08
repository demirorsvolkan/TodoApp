using System.Threading.Tasks;
using WebApplication6.Data;
using WebApplication6.Dto;
using WebApplication6.Entity;
using WebApplication6.Repository;

namespace WebApplication6.Services
{
    public class TaskServices : ITaskServices
    {
        private readonly ITaskRepository _repository;
        public TaskServices(ITaskRepository repository)
        {
            _repository = repository;
        }
        public async Task<TaskDto> AddTask(TaskDto taskDto, string userId)
        {
            var taskList = await _repository.ListTasks(taskDto.CategoryId, userId);
            var maxOrder = taskList.Any() ? taskList.Max(x => x.TaskOrder) : 0;
            var task = new Taskk
            {
                CategoryId = taskDto.CategoryId,
                TaskOrder = maxOrder+1,
                Name = taskDto.Name,
                Description = taskDto.Description,
                Priority = taskDto.Priority,
                Active = taskDto.Active,
                Deadline = taskDto.Deadline,
                UpdateTime = DateTime.Now,
                CreationTime = DateTime.Now,
            };

            await _repository.AddTask(task);

            return new TaskDto
            {
                Id = task.Id,
                CategoryId = task.CategoryId,
                TaskOrder = task.TaskOrder,
                Name = task.Name,
                Description = task.Description,
                Priority = task.Priority,
                Active = task.Active,
                Deadline = task.Deadline,
                UpdateTime = task.UpdateTime,
                CreationTime = task.CreationTime
            };
        }


        public void DeleteTask(int taskId, string userId)
        {
            _repository.DeleteTask(taskId, userId);
        }

        public async Task<TaskDto> GetTask(int taskId, string userId)
        {
            var task = await _repository.GetTask(taskId, userId);
            var taskDto = new TaskDto
            {
                Id = taskId,
                CategoryId = task.CategoryId,
                TaskOrder = task.TaskOrder,
                Name = task.Name,
                Description = task.Description,
                Priority = task.Priority,
                Active = task.Active,
                Deadline = task.Deadline,
                UpdateTime = task.UpdateTime,
                CreationTime = task.CreationTime,
            };
            return taskDto;
        }
        public async Task<TaskDto> UpdateTask(TaskDto taskDto, string userId)
        {
            var task = await _repository.GetTask(taskDto.Id, userId);
            if (task != null)
            {
                var updatedTask = new Taskk
                {
                    Id = taskDto.Id,
                    CategoryId = taskDto.CategoryId,
                    //TaskOrder = taskDto.TaskOrder,
                    Name = taskDto.Name,
                    Description = taskDto.Description,
                    Priority = taskDto.Priority,
                    Active = taskDto.Active,
                    Deadline = taskDto.Deadline,
                };
                await _repository.UpdateTask(updatedTask, userId);
            }
            return await GetTask(taskDto.Id, userId);
        }

        public async Task<List<TaskDto>> ListTasks(int categoryId, string userId) 
        {
            var tasks= await _repository.ListTasks(categoryId, userId);
            var taskDtos = tasks.Select(st => new TaskDto
            {
                Id = st.Id,
                CategoryId = st.CategoryId,
                TaskOrder = st.TaskOrder,
                Name = st.Name,
                Description = st.Description,
                Priority = st.Priority,
                Active = st.Active,
                Deadline = st.Deadline,
                UpdateTime = st.UpdateTime,
                CreationTime = st.CreationTime,
            }).ToList();

            return taskDtos;
        }

        public async Task<int> AddTaskList(List<TaskDto> list, string userId)
        {
            var taskList = new List<Taskk>();
            foreach (var taskDto in list)
            {
                var taskListCat = await _repository.ListTasks(taskDto.CategoryId, userId);
                var maxOrder = taskListCat.Any() ? taskListCat.Max(x => x.TaskOrder) : 0;
                var task = new Taskk
                {
                    CategoryId = taskDto.CategoryId,
                    TaskOrder = maxOrder+1,
                    Name = taskDto.Name,
                    Description = taskDto.Description,
                    Priority = taskDto.Priority,
                    Active = taskDto.Active,
                    Deadline = taskDto.Deadline,
                    UpdateTime = DateTime.Now,
                    CreationTime = DateTime.Now,
                };
                taskList.Add(task);
            }
            return await _repository.AddTaskList(taskList);
        }




        public async Task ReorderTask(string userId, int taskId, int newOrder)
        {
            var task = await _repository.GetTask(taskId, userId);
            if (task == null)
            {
                throw new Exception("Task not found.");
            }
            var tasks = await _repository.ListTasks(task.CategoryId, userId);
            foreach (var t in tasks)
            {
                t.TaskOrder = t.TaskOrder + 1000;
            }
            await _repository.SaveChangesAsync();
            tasks.RemoveAll(t => t.Id == taskId);
            var insertIndex = Math.Max(0, Math.Min(newOrder - 1, tasks.Count));
            tasks.Insert(insertIndex, task);

            for (int i = 0; i < tasks.Count; i++)
            {
                tasks[i].TaskOrder = i + 1;
            }
            await _repository.SaveChangesAsync();
        }
    }
}
