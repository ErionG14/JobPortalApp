using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.DBContext
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {

       public DbSet<Post> Posts { get; set; }
       public DbSet<Job> Jobs { get; set; }
       
       public DbSet<JobApplication> JobApplications { get; set; }
       
       public DbSet<Notification> Notifications { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
            
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            var hasher = new PasswordHasher<User>();

            var adminEmail = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json")
                .Build()
                .GetSection("SiteSettings")["AdminEmail"];

            var adminPassword = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json")
                .Build()
                .GetSection("SiteSettings")["AdminPassword"];

            if (!string.IsNullOrEmpty(adminEmail) && !string.IsNullOrEmpty(adminPassword))
            {
                var adminUser = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = adminEmail,
                    Name = "Admin",
                    Surname = "admin",
                    NormalizedUserName = adminEmail.ToUpper(),
                    Address = "Admin Address",
                    Email = adminEmail,
                    NormalizedEmail = adminEmail.ToUpper(),
                    EmailConfirmed = true,
                    Role = Enums.Roles.Admin
                };

                // **CRITICAL: Hash the password before setting PasswordHash**
                adminUser.PasswordHash = hasher.HashPassword(adminUser, adminPassword);

                modelBuilder.Entity<User>().HasData(adminUser);
            }
            
            modelBuilder.Entity<Post>()
                .HasOne(p => p.User) // A Post has one User
                .WithMany(u => u.Posts) // <--- CRUCIAL CHANGE: Reference the Posts collection on the User model
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<Job>()
                .HasOne(j => j.User) // A Job has one User (Manager)
                .WithMany(u => u.Jobs) // A User (Manager) can post many Jobs
                .HasForeignKey(j => j.UserId) // The foreign key is UserId in the Job model
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<JobApplication>()
                .HasOne(ja => ja.Job) // A JobApplication belongs to one Job
                .WithMany(j => j.JobApplications) // A Job can have many JobApplications
                .HasForeignKey(ja => ja.JobId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<JobApplication>()
                .HasOne(ja => ja.User) // A JobApplication belongs to one User (Applicant)
                .WithMany(u => u.JobApplications) // A User can have many JobApplications
                .HasForeignKey(ja => ja.UserId)
                .OnDelete(DeleteBehavior.Cascade); // Prevent deleting a User if they have job applications

            // Add unique constraint to prevent a user from applying to the same job multiple times
            modelBuilder.Entity<JobApplication>()
                .HasIndex(ja => new { ja.JobId, ja.UserId })
                .IsUnique();
            
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications) // Links to ICollection<Notification> Notifications on User model
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade); // If User is deleted, delete their notifications

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Job) // Notification can optionally be linked to a Job
                .WithMany() // No inverse navigation property on Job for Notifications
                .HasForeignKey(n => n.JobId)
                .OnDelete(DeleteBehavior.SetNull); // If Job is deleted, set JobId to null in notifications
        }
    }
}