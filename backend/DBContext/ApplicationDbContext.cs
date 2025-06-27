using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.DBContext
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        // DbSet for your custom entities
        

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
                    Id = Guid.NewGuid().ToString(), // Generate a unique ID
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
            
        }
    }
}