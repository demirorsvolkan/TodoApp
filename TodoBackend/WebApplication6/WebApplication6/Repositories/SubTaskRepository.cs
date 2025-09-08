using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using WebApplication6.Data;
using WebApplication6.Entity;

namespace WebApplication6.Repository
{
    public class SubTaskRepository : ISubTaskRepository
    {
        private readonly ApplicationDbContext _context;
        public SubTaskRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddTask(SubTask subTask, string userId)
        {
            var task=await _context.Tasks.Include(t=> t.Category).Where(t=> t.Id==subTask.MainTaskId && t.Category.UserId==userId).FirstOrDefaultAsync();
            if (task!=null)
            {
                await _context.SubTasks.AddAsync(subTask);
                await _context.SaveChangesAsync();
            }
            
        }

        public void DeleteTask(int taskId, string userId)
        {
            var subTask = _context.SubTasks.Find(taskId);
            var task = new Taskk { };
            if (subTask != null) 
            {
                task = _context.Tasks.Include(t => t.Category).Where(t => t.Id == subTask.MainTaskId && t.Category.UserId == userId).FirstOrDefault();
            }
            if (task!=null && subTask!=null && task.Id==subTask.MainTaskId)
            {
                _context.SubTasks.Remove(subTask);
                _context.SaveChanges();
            }
        }

        public async Task<SubTask> GetTask(int taskId, string userId)
        {
            var subTask = await _context.SubTasks.FindAsync(taskId);
            var task = new Taskk { };
            if (subTask != null)
            {
                task =await _context.Tasks.Include(t => t.Category).Where(t => t.Id == subTask.MainTaskId && t.Category.UserId == userId).FirstOrDefaultAsync();
            }
            if (task!=null && subTask!=null && task.Id == subTask.MainTaskId)
            { 
                return subTask;
            }
            return new SubTask { };
        }


        public async Task UpdateTask(SubTask subTask, string userId)
        {      
            await _context.SaveChangesAsync();
        }
        public async Task<List<SubTask>> ListTasks(int mainTaskId, string userId)
        {
            var task = await _context.Tasks.Include(t=> t.Category).Where(t=> t.Id==mainTaskId && t.Category.UserId==userId).FirstOrDefaultAsync();
            if (task != null) 
            {
                return await _context.SubTasks.Where(t => t.MainTaskId == mainTaskId).OrderBy(t => t.SubTaskOrder).ToListAsync();
            }
            return new List<SubTask> { };
        }
        public int AddTaskList(List<SubTask> taskList)
        {
            _context.SubTasks.AddRange(taskList);
            return _context.SaveChanges();
        }
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
