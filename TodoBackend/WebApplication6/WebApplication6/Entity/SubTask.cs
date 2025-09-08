using System.ComponentModel.DataAnnotations;
using WebApplication6.Dto;

namespace WebApplication6.Entity
{
    public class SubTask
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int MainTaskId {  get; set; }
        public int SubTaskOrder { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Priority { get; set; }
        public bool Active { get; set; }
        public DateTime Deadline { get; set; }
        public DateTime UpdateTime { get; set; }
        public DateTime CreationTime { get; set; }
        public Taskk Task { get; set; }



    }
}
