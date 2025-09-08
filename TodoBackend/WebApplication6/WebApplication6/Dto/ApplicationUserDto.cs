using WebApplication6.Entity;

namespace WebApplication6.Dto
{
    public class ApplicationUserDto
    {
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public DateTime BirthDay { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
