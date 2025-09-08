using WebApplication6.Dto;

namespace WebApplication6.Services
{
    public interface IFileServices
    {
        byte[] CreateTemplate();
        //byte[] GetTaskListFile(List<IResponse> taskList, TaskDto? mainTask);
        Task<byte[]> GetTaskListFileAsync(List<IResponse> taskList, TaskDto? mainTask, string userId, bool withSub);
        Dictionary<int, List<int>> CheckFile(IFormFile file);
        List<IResponse> ReadFile(IFormFile file, int? mainTaskId, int? categoryId);
    }
}
