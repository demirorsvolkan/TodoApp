using WebApplication6.Data;
using WebApplication6.Dto;

namespace WebApplication6.Services
{
    public interface ITaskServices
    {
        Task<TaskDto> GetTask(int taskId, string userId);
        Task<TaskDto> AddTask(TaskDto taskDto, string userId);
        void DeleteTask(int taskId, string userId);
        Task<TaskDto> UpdateTask(TaskDto taskDto, string userId);
        Task<List<TaskDto>> ListTasks(int categoryId, string userId);
        Task<int> AddTaskList(List<TaskDto> list,  string userId);
        Task ReorderTask(string userId, int taskId, int newOrder);
    }
}
