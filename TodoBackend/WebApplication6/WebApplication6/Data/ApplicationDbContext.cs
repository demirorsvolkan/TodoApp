using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Data.Common;
using System.Reflection.Emit;
using WebApplication6.Entity;

namespace WebApplication6.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Taskk> Tasks { get; set; }
        public DbSet<SubTask> SubTasks { get; set; }
        public DbSet<Categoryy> Categories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<SubTask>()
                .HasOne(s => s.Task)
                .WithMany(t => t.SubTasks)
                .HasForeignKey(s => s.MainTaskId);
            modelBuilder.Entity<Taskk>()
                .HasOne(t => t.Category)
                .WithMany(a => a.Tasks)
                .HasForeignKey(t => t.CategoryId);
            modelBuilder.Entity<Categoryy>()
                .HasOne(t => t.ApplicationUser)
                .WithMany(a => a.Categories)
                .HasForeignKey(t => t.UserId);
            modelBuilder.Entity<Taskk>()
                .HasIndex(t => new { t.CategoryId, t.TaskOrder })
                .IsUnique();
            modelBuilder.Entity<SubTask>()
                .HasIndex(t => new { t.MainTaskId, t.SubTaskOrder })
                .IsUnique();
            modelBuilder.Entity<Categoryy>()
                .HasIndex(c => new { c.UserId, c.CategoryOrder })
                .IsUnique();
        }
    }
}
