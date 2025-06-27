using backend.DataSeed;
using backend.DBContext;
using backend.Middleware;
using backend.Services;
using Microsoft.EntityFrameworkCore; // Ensure these namespaces match your project structure

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
ServiceConfiguration.ConfigureServices(builder); // This method should contain all your services registrations

var app = builder.Build();

// Configure the HTTP request pipeline.

// Exception Middleware should be very early to catch most exceptions
app.UseMiddleware<ExceptionMiddleware>();

// Development environment specific middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS MUST come before Authentication/Authorization
// Ensure "_myAllowSpecificOrigins" matches your policy name defined in ServiceConfiguration.ConfigureServices
app.UseCors("_myAllowSpecificOrigins");

app.UseHttpsRedirection(); // Redirect HTTP to HTTPS
// app.UseStaticFiles(); // Generally not needed for a pure API, but harmless
// app.UseStatusCodePages(); // Good for development, provides basic response for status codes

// --- CRITICAL SECTION: Apply Migrations and Seed Roles/Data ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.Migrate(); // Apply any pending migrations

        // Ensure roles are seeded here
        await RoleInitializer.SeedRoles(services); // <-- THIS IS THE CALL YOU NEED TO VERIFY

        // Optional: If you decided to move ALL user/role seeding out of OnModelCreating,
        // you would call your admin/user seeder here as well.

    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred during database migration or role seeding.");
        // Consider re-throwing or exiting if this is a fatal startup error
    }
}

// Authentication MUST come before Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map your API controllers
app.MapControllers();

app.Run();