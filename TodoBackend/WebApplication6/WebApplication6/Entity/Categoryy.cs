using System.ComponentModel.DataAnnotations;

namespace WebApplication6.Entity
{
    public class Categoryy
    {
        [Key]
        public int Id { get; set; }
        public string UserId { get; set; }
        public int CategoryOrder {  get; set; }
        public string CategoryName { get; set; }
        public ICollection<Taskk> Tasks { get; set; }
        public ApplicationUser ApplicationUser { get; set; }

    }
}
