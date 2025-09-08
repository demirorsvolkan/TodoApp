using DocumentFormat.OpenXml.Drawing.Diagrams;
using DocumentFormat.OpenXml.Wordprocessing;
using WebApplication6.Dto;
using WebApplication6.Entity;
using WebApplication6.Repositories;

namespace WebApplication6.Services
{
    public class CategoryServices : ICategoryServices
    {
        private readonly ICategoryRepository _repository;
        public CategoryServices(ICategoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<CategoryDto> AddCategory(CategoryDto categoryDto, string userId)
        {
            var catList = await _repository.ListCategories(userId);
            var maxOrder = catList.Any() ? catList.Max(x => x.CategoryOrder) : 0;
            var category = new Categoryy
            {
                UserId = userId,
                CategoryOrder = maxOrder+1,
                CategoryName = categoryDto.CategoryName,
            };
            await _repository.AddCategory(category, userId);
            var result = new CategoryDto
            {
                Id = category.Id,
                UserId = category.UserId,
                CategoryOrder = category.CategoryOrder,
                CategoryName = category.CategoryName,
            };
            return result;
        }

        public void DeleteCategory(int categoryId, string userId)
        {
            _repository.DeleteCategory(categoryId, userId);
        }

        public async Task<CategoryDto> GetCategory(int categoryId, string userId)
        {
            var category = await _repository.GetCategory(categoryId, userId);
            var result = new CategoryDto
            {
                Id = category.Id,
                UserId = category.UserId,
                CategoryOrder = category.CategoryOrder,
                CategoryName = category.CategoryName,
            };
            return result;
        }

        public async Task<List<CategoryDto>> ListCategories(string userId)
        {
            var categories = await _repository.ListCategories(userId);
            var categoryDtos = categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                UserId = c.UserId,
                CategoryOrder = c.CategoryOrder,
                CategoryName = c.CategoryName
            }).ToList();
            return categoryDtos;
        }

        public async Task<CategoryDto> UpdateCategory(CategoryDto categoryDto, string userId)
        {
            var category = await _repository.GetCategory(categoryDto.Id, userId);
            if (category == null) return null;
            category.CategoryName = categoryDto.CategoryName;
            await _repository.UpdateCategory(category, userId);
            return await GetCategory(categoryDto.Id, userId);
        }

        public async Task ReorderCategory(string userId, int categoryId, int newOrder)
        {
            var category = await _repository.GetCategory(categoryId, userId);
            if (category == null)
            {
                throw new Exception("Task not found.");
            }
            var categotries = await _repository.ListCategories(userId);
            foreach (var c in categotries)
            {
                c.CategoryOrder = c.CategoryOrder + 1000;
            }
            await _repository.SaveChangesAsync();
            categotries.RemoveAll(c => c.Id == categoryId);
            var insertIndex = Math.Max(0, Math.Min(newOrder - 1, categotries.Count));
            categotries.Insert(insertIndex, category);

            for (int i = 0; i < categotries.Count; i++)
            {
                categotries[i].CategoryOrder = i + 1;
            }
            await _repository.SaveChangesAsync();
        }
        
    }
}
