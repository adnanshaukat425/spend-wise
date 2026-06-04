using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpendWise.Domain.Entities;
using SpendWise.Domain.Enums;
using SpendWise.Infrastructure.Persistence;

namespace SpendWise.Infrastructure.Persistence.Seed;

public interface IDataSeeder
{
    Task SeedAsync(CancellationToken cancellationToken = default);
}

public class DataSeeder : IDataSeeder
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<DataSeeder> _logger;

    public DataSeeder(ApplicationDbContext db, ILogger<DataSeeder> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await SeedCategoriesAsync(cancellationToken);
        await SeedSubscriptionPlansAsync(cancellationToken);
        _logger.LogInformation("Seed data applied.");
    }

    private async Task SeedCategoriesAsync(CancellationToken cancellationToken)
    {
        if (await _db.Categories.AnyAsync(cancellationToken))
        {
            return;
        }

        var categories = new (string Slug, string Name, CategoryType Type, string Icon, string Bg, string Color, int Order)[]
        {
            ("food", "Food", CategoryType.Expense, "restaurant-outline", "#FFE4E1", "#EF4444", 1),
            ("transport", "Transport", CategoryType.Expense, "car-outline", "#DBEAFE", "#3B82F6", 2),
            ("shopping", "Shopping", CategoryType.Expense, "bag-outline", "#FDE8CC", "#E07B39", 3),
            ("coffee", "Coffee", CategoryType.Expense, "cafe-outline", "#FFF3CD", "#F59E0B", 4),
            ("home", "Home", CategoryType.Expense, "home-outline", "#ECFDF5", "#10B981", 5),
            ("utilities", "Utilities", CategoryType.Expense, "flash-outline", "#FEFCE8", "#EAB308", 6),
            ("health", "Health", CategoryType.Expense, "heart-outline", "#FEE2E2", "#EF4444", 7),
            ("travel", "Travel", CategoryType.Expense, "airplane-outline", "#DBEAFE", "#3B82F6", 8),
            ("fun", "Fun", CategoryType.Expense, "game-controller-outline", "#F3EEFF", "#8B5CF6", 9),
            ("education", "Education", CategoryType.Expense, "school-outline", "#EFF6FF", "#3B82F6", 10),
            ("bills", "Bills", CategoryType.Expense, "tv-outline", "#FEE2E2", "#EF4444", 11),
            ("income", "Income", CategoryType.Income, "trending-up-outline", "#D1FAE5", "#10B981", 12),
        };

        foreach (var c in categories)
        {
            _db.Categories.Add(new Category
            {
                Id = Guid.NewGuid(),
                Slug = c.Slug,
                Name = c.Name,
                Type = c.Type,
                IconKey = c.Icon,
                IconBg = c.Bg,
                IconColor = c.Color,
                SortOrder = c.Order,
            });
        }

        await _db.SaveChangesAsync(cancellationToken);
    }

    private async Task SeedSubscriptionPlansAsync(CancellationToken cancellationToken)
    {
        if (await _db.SubscriptionPlans.AnyAsync(cancellationToken))
        {
            return;
        }

        var features = JsonSerializer.Serialize(new[]
        {
            "Unlimited AI-powered insights",
            "Personalized savings recommendations",
            "Spending predictions & forecasts",
            "Smart budget optimization",
            "Detailed monthly reports",
            "Receipt scanning & auto-categorization",
            "Export data to CSV/PDF",
            "Priority customer support",
            "Custom budget categories",
            "Bill reminders & alerts",
        });

        _db.SubscriptionPlans.AddRange(
            new SubscriptionPlan
            {
                Id = Guid.NewGuid(),
                Slug = "monthly",
                Name = "Monthly",
                Price = 4.99m,
                BillingPeriod = "/month",
                SortOrder = 1,
                FeaturesJson = features,
            },
            new SubscriptionPlan
            {
                Id = Guid.NewGuid(),
                Slug = "yearly",
                Name = "Yearly",
                Price = 39.99m,
                BillingPeriod = "/year",
                Badge = "MOST POPULAR",
                Tag = "33% off",
                IsPopular = true,
                SortOrder = 2,
                FeaturesJson = features,
            },
            new SubscriptionPlan
            {
                Id = Guid.NewGuid(),
                Slug = "lifetime",
                Name = "Lifetime",
                Price = 99.99m,
                BillingPeriod = "/one-time",
                Tag = "Best value",
                SortOrder = 3,
                FeaturesJson = features,
            });

        await _db.SaveChangesAsync(cancellationToken);
    }
}
