using Microsoft.EntityFrameworkCore;
using WebApplication6.Data;
using WebApplication6.Entity;

namespace WebApplication6.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly ApplicationDbContext _context;
        public CategoryRepository(ApplicationDbContext context) {  _context = context; }
        public async Task AddCategory(Categoryy category, string userId)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
        }

        public void DeleteCategory(int categoryId, string userId)
        {
            var category = _context.Categories.Find(categoryId);
            if (category != null && userId==category.UserId) 
            { 
                _context.Categories.Remove(category);
                _context.SaveChanges();
            }
        }

        public async Task<Categoryy> GetCategory(int categoryId, string userId)
        {
            var category =await _context.Categories.FindAsync(categoryId);
            if (category != null && userId == category.UserId)
            {
                return category;
            }
            return new Categoryy { };
        }

        public async Task<List<Categoryy>> ListCategories(string userId)
        {
            return await _context.Categories.Where(c => c.UserId == userId).OrderBy(c => c.CategoryOrder).ToListAsync();
        }

        public async Task UpdateCategory(Categoryy category, string userId)
        {
            await _context.SaveChangesAsync();
        }
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
