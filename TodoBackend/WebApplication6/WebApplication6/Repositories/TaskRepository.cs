using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using WebApplication6.Data;
using WebApplication6.Dto;
using WebApplication6.Entity;

namespace WebApplication6.Repository
{
    public class TaskRepository : ITaskRepository
    {
        private readonly ApplicationDbContext _context;
        public TaskRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task AddTask(Taskk task)
        {
            await _context.Tasks.AddAsync(task);
            await _context.SaveChangesAsync();
        }

        public void DeleteTask(int taskId, string userId)
        {
            var task = _context.Tasks.Include(t => t.Category).Where(t => t.Id == taskId && t.Category.UserId == userId).FirstOrDefault();
            if (task != null)
            {
                _context.Tasks.Remove(task);
                _context.SaveChanges();
            }
        }
        public async Task<Taskk> GetTask(int taskId, string userId)
        {
            var task=await _context.Tasks.Include(t=> t.Category).Where(t=> t.Id == taskId && t.Category.UserId == userId).FirstOrDefaultAsync();
            if (task != null)
            {
                return task;
            }
            return new Taskk { };
        }

        public async Task<bool> UpdateTask(Taskk updatedTask, string userId)
        {
            var existingTask = await _context.Tasks.Include(t => t.Category).Where(t => t.Id == updatedTask.Id && t.Category.UserId == userId).FirstOrDefaultAsync();
            if (existingTask == null)
                return false;

            existingTask.Name = updatedTask.Name;
            existingTask.Description = updatedTask.Description;
            existingTask.Priority = updatedTask.Priority;
            existingTask.Active = updatedTask.Active;
            existingTask.Deadline = updatedTask.Deadline;
            existingTask.UpdateTime = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<List<Taskk>> ListTasks(int categoryId, string userId)
        {
            return await _context.Tasks.Include(t=> t.Category).Where(t => t.Category.UserId == userId && t.CategoryId == categoryId).OrderBy(t => t.TaskOrder).ToListAsync();
        }

        public async Task<int> AddTaskList(List<Taskk> taskList)
        {
            await _context.Tasks.AddRangeAsync(taskList);
            return await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}

