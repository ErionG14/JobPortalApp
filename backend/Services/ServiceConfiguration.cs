using System.Text;
using System.Text.Json.Serialization;
using backend.DBContext;
using backend.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace backend.Services;

public static class ServiceConfiguration
{
    public static void ConfigureServices(WebApplicationBuilder builder)
    {
        // Add controllers and JSON options (removed duplication)
        builder.Services.AddControllers(options =>
        {
            // You can add global MVC options here if needed later
        }).AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        });

        builder.Services.AddEndpointsApiExplorer(); // Necessary for Swagger API exploration

        // Add Swagger
        builder.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo { Title = "JobPortal-App", Version = "v1" });
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Please insert a valid token",
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                BearerFormat = "JWT",
                Scheme = "Bearer",
            });
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    new string[] { }
                }
            });
        });

        // Add TokenService
        builder.Services.AddScoped<TokenService, TokenService>();

        // Configure ASP.NET Core Identity
        builder.Services.AddIdentity<User, IdentityRole>(options =>
            {
                options.SignIn.RequireConfirmedAccount = true;
                options.User.RequireUniqueEmail = true;
                options.Password.RequireDigit = false;
                options.Password.RequiredLength = 6;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
            })
            .AddRoles<IdentityRole>() // Add role management
            .AddEntityFrameworkStores<ApplicationDbContext>() // Use Entity Framework Core for Identity storage
            .AddDefaultTokenProviders(); // For password reset tokens, email confirmation tokens etc.

        // Configure the DbContext for MySQL
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrEmpty(connectionString))
        {
            // Log an error or throw an exception if connection string is missing
            // This is crucial for debugging database connection issues
            throw new InvalidOperationException("DefaultConnection connection string is not configured.");
        }
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
        });

        // Get JWT settings from configuration
        var validIssuer = builder.Configuration.GetValue<string>("JwtTokenSettings:ValidIssuer");
        var validAudience = builder.Configuration.GetValue<string>("JwtTokenSettings:ValidAudience");
        var symmetricSecurityKey = builder.Configuration.GetValue<string>("JwtTokenSettings:SymmetricSecurityKey");

        // Validate that JWT settings are not null or empty
        if (string.IsNullOrEmpty(validIssuer) || string.IsNullOrEmpty(validAudience) || string.IsNullOrEmpty(symmetricSecurityKey))
        {
            throw new InvalidOperationException("One or more JWT token settings are missing or empty in configuration.");
        }

        // Configure JWT Bearer Authentication
        builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.IncludeErrorDetails = true; // Good for development to see errors
                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    ClockSkew = TimeSpan.Zero, // Default to 5 min, Zero means no leeway
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = validIssuer,
                    ValidAudience = validAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(symmetricSecurityKey)
                    ),
                };
            });

        // Configure CORS for React Native Development
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("_myAllowSpecificOrigins",
                policy =>
                {
                    policy.WithOrigins("http://localhost:3000",        // If you also have a web frontend
                                       "http://localhost:8081",        // React Native Metro Bundler default
                                       "exp://*.ngrok.io",             // For Expo Go tunnels (if you use Expo)
                                       "https://*.ngrok.io",           // For Expo Go tunnels (if you use Expo)
                                       "http://10.0.2.2:5000",         // Android Emulator: local host via http
                                       "https://10.0.2.2:5001",        // Android Emulator: local host via https
                                       "http://192.168.1.X:5000",      // Replace X.X with your actual local IP range if testing on physical device on LAN (http)
                                       "https://192.168.1.X:5001")     // Replace X.X with your actual local IP range if testing on physical device on LAN (https)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials(); // Important for sending cookies/auth headers
                });
        });
    }
}