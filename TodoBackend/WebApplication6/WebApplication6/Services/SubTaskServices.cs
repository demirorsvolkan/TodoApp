using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using WebApplication6.Dto;
using WebApplication6.Entity;
using WebApplication6.Repository;

namespace WebApplication6.Services
{
    public class SubTaskServices : ISubTaskServices
    {
        private readonly ISubTaskRepository _repository;
        private readonly ITaskRepository _taskRepository;
        public SubTaskServices(ISubTaskRepository repository, ITaskRepository taskRepository)
        {
            _repository = repository;
            _taskRepository = taskRepository;
        }
        public async Task<SubTaskDto> AddTask(SubTaskDto subTaskDto, string userId)
        {
            var mainTask = await _taskRepository.GetTask(subTaskDto.MainTaskId, userId);

            if (subTaskDto.Deadline > mainTask.Deadline)
            {
                mainTask.Deadline = subTaskDto.Deadline;
            }
            var taskList = await _repository.ListTasks(subTaskDto.MainTaskId, userId);
            var maxOrder = taskList.Any() ? taskList.Max(x => x.SubTaskOrder) : 0;

            var subTask = new SubTask
            {
                MainTaskId = subTaskDto.MainTaskId,
                SubTaskOrder = maxOrder+1,
                Name = subTaskDto.Name,
                Description = subTaskDto.Description,
                Priority = subTaskDto.Priority,
                Active = subTaskDto.Active,
                Deadline = subTaskDto.Deadline,
                UpdateTime = DateTime.Now,
                CreationTime = DateTime.Now,
            };

            await _repository.AddTask(subTask, userId);

            var resultDto = new SubTaskDto
            {
                Id = subTask.Id, 
                MainTaskId = subTask.MainTaskId,
                SubTaskOrder = subTask.SubTaskOrder,
                Name = subTask.Name,
                Description = subTask.Description,
                Priority = subTask.Priority,
                Active = subTask.Active,
                Deadline = subTask.Deadline,
                UpdateTime = subTask.UpdateTime,
                CreationTime = subTask.CreationTime,
            };

            return resultDto;
        }


        public void DeleteTask(int taskId, string userId)
        {
            _repository.DeleteTask(taskId, userId);
        }

      

        public async Task<SubTaskDto> GetTask(int taskId, string userId)
        {
            var subTask =await _repository.GetTask(taskId, userId);
            
            var subTaskDto = new SubTaskDto
            {
                Id = taskId,
                MainTaskId = subTask.MainTaskId,
                SubTaskOrder = subTask.SubTaskOrder,
                Name = subTask.Name,
                Description = subTask.Description,
                Priority = subTask.Priority,
                Active = subTask.Active,
                Deadline = subTask.Deadline,
                UpdateTime = subTask.UpdateTime,
                CreationTime = subTask.CreationTime,
            };
            return subTaskDto;
        }


        public async Task<SubTaskDto> UpdateTask(SubTaskDto subTaskDto, string userId)
        {
            var subTask = await _repository.GetTask(subTaskDto.Id, userId);

            if (subTask == null) return null;

            var mainTask = await _taskRepository.GetTask(subTaskDto.MainTaskId, userId);

            if (mainTask != null && subTaskDto.Deadline > mainTask.Deadline)
            {
                mainTask.Deadline = subTaskDto.Deadline;
            }

            //subTask.SubTaskOrder = subTaskDto.SubTaskOrder;
            subTask.Name = subTaskDto.Name;
            subTask.Description = subTaskDto.Description;
            subTask.Priority = subTaskDto.Priority;
            subTask.Active = subTaskDto.Active;
            subTask.Deadline = subTaskDto.Deadline;
            subTask.UpdateTime = DateTime.Now;

            await _repository.UpdateTask(subTask, userId);

            if (mainTask != null)
            {
                mainTask.UpdateTime = DateTime.Now;
                await _taskRepository.UpdateTask(mainTask, userId);
            }

            return await GetTask(subTaskDto.Id, userId);
        }



        public async Task<List<SubTaskDto>> ListTasks(int mainTaskId, string userId)
        {
            var subTasks = await _repository.ListTasks(mainTaskId, userId);
            var subTaskDtos = subTasks.Select(st => new SubTaskDto
            {
                Id = st.Id,
                MainTaskId = st.MainTaskId,
                SubTaskOrder = st.SubTaskOrder,
                Name = st.Name,
                Description = st.Description,
                Priority = st.Priority,
                Active = st.Active,
                Deadline = st.Deadline,
                UpdateTime = st.UpdateTime,
                CreationTime = st.CreationTime,
            }).ToList();

            return subTaskDtos;
        }

        public async Task<int> AddTaskList(List<SubTaskDto> list, string userId)
        {
            var subTaskList = new List<SubTask>();
            foreach (var subTaskDto in list)
            {
                var taskList = await _repository.ListTasks(subTaskDto.MainTaskId, userId);
                var maxOrder = taskList.Any() ? taskList.Max(x => x.SubTaskOrder) : 0;
                var subTask = new SubTask
                {
                    MainTaskId = subTaskDto.MainTaskId,
                    SubTaskOrder = maxOrder+1,
                    Name = subTaskDto.Name,
                    Description = subTaskDto.Description,
                    Priority = subTaskDto.Priority,
                    Active = subTaskDto.Active,
                    Deadline = subTaskDto.Deadline,
                    UpdateTime = DateTime.Now,
                    CreationTime = DateTime.Now,
                };
                var task =await _taskRepository.GetTask(subTask.MainTaskId, userId);
                if (task != null) 
                {
                    subTaskList.Add(subTask);
                }
            }
            return _repository.AddTaskList(subTaskList);
        }
        public async Task ReorderTask(string userId, int taskId, int newOrder)
        {
            var subTask = await _repository.GetTask(taskId, userId);
            if (subTask == null)
            {
                throw new Exception("Task not found.");
            }
            var subTasks = await _repository.ListTasks(subTask.MainTaskId, userId);
            foreach (var st in subTasks)
            {
                st.SubTaskOrder = st.SubTaskOrder + 1000;
            }
            await _repository.SaveChangesAsync();
            subTasks.RemoveAll(st => st.Id == taskId);
            var insertIndex = Math.Max(0, Math.Min(newOrder - 1, subTasks.Count));
            subTasks.Insert(insertIndex, subTask);

            for (int i = 0; i < subTasks.Count; i++)
            {
                subTasks[i].SubTaskOrder = i + 1;
            }
            await _repository.SaveChangesAsync();
        }


    }
}
