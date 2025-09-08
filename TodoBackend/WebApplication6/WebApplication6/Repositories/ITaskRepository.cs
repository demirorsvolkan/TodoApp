using WebApplication6.Data;
using WebApplication6.Entity;

namespace WebApplication6.Repository
{
    public interface ITaskRepository
    {
        Task<Taskk> GetTask(int taskId, string userId);
        Task AddTask(Taskk task);
        void DeleteTask(int taskId, string userId);
        Task<bool> UpdateTask(Taskk task, string userId);
        Task<List<Taskk>> ListTasks(int categoryId, string userId);
        Task<int> AddTaskList(List<Taskk> taskList);
        Task SaveChangesAsync();


    }
}
