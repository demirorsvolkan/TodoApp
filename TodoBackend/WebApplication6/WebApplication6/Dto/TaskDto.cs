namespace WebApplication6.Dto
{
    public class TaskDto : IResponse
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public int TaskOrder { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Priority { get; set; }
        public bool Active { get; set; }
        public DateTime Deadline { get; set; }
        public DateTime UpdateTime { get; set; }
        public DateTime CreationTime { get; set; }

    }
}
