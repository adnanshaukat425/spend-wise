using Microsoft.EntityFrameworkCore;
using SpendWise.Application.Common;
using SpendWise.Application.Common.Interfaces;
using SpendWise.Domain.Entities;

namespace SpendWise.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IApplicationDbContext _db;

    public NotificationService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task PublishAsync(
        Guid userId,
        string title,
        string body,
        string iconKey,
        string iconColor,
        string iconBg,
        CancellationToken cancellationToken = default)
    {
        var enabled = await _db.UserPreferences
            .Where(p => p.UserId == userId)
            .Select(p => p.NotificationsEnabled)
            .FirstOrDefaultAsync(cancellationToken);

        if (!enabled)
        {
            return;
        }

        _db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Body = body,
            IconKey = iconKey,
            IconColor = iconColor,
            IconBg = iconBg,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
        });

        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task CheckBudgetThresholdsAsync(Guid userId, Guid budgetPeriodId, CancellationToken cancellationToken = default)
    {
        var period = await _db.BudgetPeriods
            .Include(p => p.Lines)
            .ThenInclude(l => l.Category)
            .FirstOrDefaultAsync(p => p.Id == budgetPeriodId && p.UserId == userId, cancellationToken);

        if (period == null)
        {
            return;
        }

        var spentByCategory = await BudgetHelper.GetSpentByCategoryAsync(
            userId, period.Year, period.Month, _db, cancellationToken);

        foreach (var line in period.Lines)
        {
            var spent = spentByCategory.GetValueOrDefault(line.CategoryId, 0m);
            if (line.LimitAmount <= 0)
            {
                continue;
            }

            var pct = spent / line.LimitAmount * 100;
            var title = pct >= 100
                ? $"{line.Category.Name} budget exceeded"
                : pct >= 90
                    ? $"{line.Category.Name} budget warning"
                    : null;

            if (title == null)
            {
                continue;
            }

            var body = pct >= 100
                ? $"You've spent ${spent:F2} of your ${line.LimitAmount:F2} limit."
                : $"You've used {pct:F0}% of your {line.Category.Name.ToLower()} budget.";

            await PublishAsync(
                userId,
                title,
                body,
                line.Category.IconKey,
                line.Category.IconColor,
                line.Category.IconBg,
                cancellationToken);
        }
    }
}
