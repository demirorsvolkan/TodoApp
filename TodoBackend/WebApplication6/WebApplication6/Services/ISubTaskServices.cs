using WebApplication6.Dto;

namespace WebApplication6.Services
{
    public interface ISubTaskServices
    {
        Task<SubTaskDto> GetTask(int taskId, string userId);
        Task<SubTaskDto> AddTask(SubTaskDto subTaskDto, string userId);
        void DeleteTask(int taskId, string userId);
        Task<SubTaskDto> UpdateTask(SubTaskDto subTaskDto, string userId);
        Task<List<SubTaskDto>> ListTasks(int mainTaskId, string userId);
        Task<int> AddTaskList(List<SubTaskDto> list, string userId);
        Task ReorderTask(string userId, int taskId, int newOrder);
    }
}
