using Microsoft.AspNetCore.Identity;

namespace backend.DataSeed;

public class RoleInitializer
{
    public static async Task SeedRoles(IServiceProvider serviceProvider)
    {
        using (var scope = serviceProvider.CreateScope())
        {
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            if (!await roleManager.RoleExistsAsync("User"))
            {
                await roleManager.CreateAsync(new IdentityRole("User"));
            }
            
            // Seed the Admin role
            if (!await roleManager.RoleExistsAsync("Admin"))
            {
                await roleManager.CreateAsync(new IdentityRole("Admin"));
            }
            
            // Seed the Manager role
            if (!await roleManager.RoleExistsAsync("Manager"))
            {
                await roleManager.CreateAsync(new IdentityRole("Manager"));
            }
        }
    }
}