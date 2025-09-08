using WebApplication6.Entity;

namespace WebApplication6.Repositories
{
    public interface ICategoryRepository
    {
        Task<Categoryy> GetCategory(int categoryId, string userId);
        Task AddCategory(Categoryy category, string userId);
        void DeleteCategory(int categoryId, string userId);
        Task UpdateCategory(Categoryy category, string userId);
        Task<List<Categoryy>> ListCategories(string userId);
        Task SaveChangesAsync();
    }
}
