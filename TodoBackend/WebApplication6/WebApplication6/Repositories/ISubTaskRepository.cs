using WebApplication6.Entity;

namespace WebApplication6.Repository
{
    public interface ISubTaskRepository
    {
        Task<SubTask> GetTask(int taskId, string userId);
        Task AddTask(SubTask subTask, string userId);
        void DeleteTask(int taskId, string userId);
        Task UpdateTask(SubTask subTask, string userId);
        Task<List<SubTask>> ListTasks(int mainTaskId, string userId);
        int AddTaskList(List<SubTask> taskList);
        Task SaveChangesAsync();
    }
}
