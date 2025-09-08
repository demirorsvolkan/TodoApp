using WebApplication6.Dto;

namespace WebApplication6.Services
{
    public interface ICategoryServices
    {
        Task<CategoryDto> GetCategory(int categoryId, string userId);
        Task<CategoryDto> AddCategory(CategoryDto categoryDto, string userId);
        void DeleteCategory(int categoryId, string userId);
        Task<CategoryDto> UpdateCategory(CategoryDto categoryDto, string userId);
        Task<List<CategoryDto>> ListCategories(string userId);
        Task ReorderCategory(string userId, int categoryId, int newOrder);
    }
}
