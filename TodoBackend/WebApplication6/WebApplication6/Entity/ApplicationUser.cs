using Microsoft.AspNetCore.Identity;
namespace WebApplication6.Entity
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime BirthDay { get; set; }
        public DateTime CreatedDate { get; set; }
        public ICollection<Categoryy>   Categories { get; set; }

    }
}
