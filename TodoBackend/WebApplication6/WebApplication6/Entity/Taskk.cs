using System.ComponentModel.DataAnnotations;
using WebApplication6.Dto;
namespace WebApplication6.Entity
{
    public class Taskk
    {
        [Key]
        public int Id { get; set; }
        [Required] 
        public int CategoryId { get; set; }
        public int TaskOrder {  get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Priority { get; set; }
        public bool Active { get; set; }
        public DateTime Deadline { get; set; }
        public DateTime UpdateTime { get; set; }
        public DateTime CreationTime { get; set; }
        public ICollection<SubTask> SubTasks { get; set; }
        public Categoryy Category { get; set; }

    }
}
