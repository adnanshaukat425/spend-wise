using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SpendWise.Application.Common.Interfaces;
using SpendWise.Domain.Entities;
using SpendWise.Infrastructure.Identity;
using SpendWise.Infrastructure.Persistence;

namespace SpendWise.Application.Tests;

public static class TestServiceProvider
{
    public static void Configure(IServiceCollection services)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseInMemoryDatabase(Guid.NewGuid().ToString()));
        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());
        services.AddIdentityCore<ApplicationUser>()
            .AddEntityFrameworkStores<ApplicationDbContext>();
        services.AddLogging();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddSingleton<IConfiguration>(new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:SigningKey"] = "test-signing-key-for-unit-tests-min-32-chars",
                ["Jwt:Issuer"] = "SpendWise.Test",
                ["Jwt:Audience"] = "SpendWise.Test",
            })
            .Build());
    }

    public static async Task SeedCategoriesAsync(IApplicationDbContext db)
    {
        if (await db.Categories.AnyAsync())
        {
            return;
        }

        db.Categories.Add(new Category
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Slug = "food",
            Name = "Food",
            Type = Domain.Enums.CategoryType.Expense,
            IconKey = "restaurant-outline",
            IconBg = "#FFE4E1",
            IconColor = "#EF4444",
            SortOrder = 1,
        });
        db.Categories.Add(new Category
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Slug = "income",
            Name = "Income",
            Type = Domain.Enums.CategoryType.Income,
            IconKey = "trending-up-outline",
            IconBg = "#D1FAE5",
            IconColor = "#10B981",
            SortOrder = 2,
        });
        await db.SaveChangesAsync();
    }
}
