using Microsoft.EntityFrameworkCore;
using SpendWise.Application.Common;
using SpendWise.Application.Common.Interfaces;
using SpendWise.Domain.Entities;
using SpendWise.Domain.Enums;

namespace SpendWise.Infrastructure.Services;

public class InsightGenerator : IInsightGenerator
{
    private readonly IApplicationDbContext _db;

    public InsightGenerator(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<InsightDto>> GenerateAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var insights = new List<InsightDto>();
        var (year, month) = BudgetHelper.CurrentPeriod();
        var period = await _db.BudgetPeriods
            .Include(p => p.Lines)
            .ThenInclude(l => l.Category)
            .FirstOrDefaultAsync(p => p.UserId == userId && p.Year == year && p.Month == month, cancellationToken);

        if (period == null)
        {
            insights.Add(new InsightDto(
                "welcome",
                "Tip",
                "Set up your budget",
                "Create category limits to track spending more effectively.",
                "Go to Budget",
                "/budget"));
            return insights;
        }

        var spentByCategory = await BudgetHelper.GetSpentByCategoryAsync(userId, year, month, _db, cancellationToken);

        foreach (var line in period.Lines)
        {
            var spent = spentByCategory.GetValueOrDefault(line.CategoryId, 0m);
            if (line.LimitAmount <= 0)
            {
                continue;
            }

            var pct = spent / line.LimitAmount * 100;
            if (pct >= 100)
            {
                insights.Add(new InsightDto(
                    $"over-{line.Category.Slug}",
                    "Alert",
                    $"{line.Category.Name} budget exceeded",
                    $"You've spent ${spent:F0} of your ${line.LimitAmount:F0} limit.",
                    "View Budget",
                    "/budget"));
            }
            else if (pct >= 90)
            {
                insights.Add(new InsightDto(
                    $"warn-{line.Category.Slug}",
                    "Alert",
                    $"{line.Category.Name} nearly at limit",
                    $"You're at {pct:F0}% of your {line.Category.Name.ToLower()} budget.",
                    "View Budget",
                    "/budget"));
            }
        }

        var totalSpent = spentByCategory.Values.Sum();
        var totalLimit = period.TotalLimit > 0 ? period.TotalLimit : period.Lines.Sum(l => l.LimitAmount);
        if (totalLimit > 0 && totalSpent < totalLimit * 0.5m)
        {
            insights.Add(new InsightDto(
                "savings-positive",
                "Positive",
                "Great progress this month",
                $"You've only used {totalSpent / totalLimit * 100:F0}% of your overall budget.",
                null,
                null));
        }

        var last7Start = DateTime.UtcNow.Date.AddDays(-6);
        var weekSpend = await _db.Transactions
            .Where(t => t.UserId == userId
                && t.OccurredAt >= last7Start
                && t.Category.Type == CategoryType.Expense)
            .SumAsync(t => Math.Abs(t.Amount), cancellationToken);

        var prev7Start = last7Start.AddDays(-7);
        var prevWeekSpend = await _db.Transactions
            .Where(t => t.UserId == userId
                && t.OccurredAt >= prev7Start
                && t.OccurredAt < last7Start
                && t.Category.Type == CategoryType.Expense)
            .SumAsync(t => Math.Abs(t.Amount), cancellationToken);

        if (prevWeekSpend > 0 && weekSpend > prevWeekSpend * 1.25m)
        {
            insights.Add(new InsightDto(
                "spending-spike",
                "Alert",
                "Spending spike detected",
                "Your spending this week is 25% higher than last week.",
                "View Expenses",
                "/expenses"));
        }

        if (insights.Count == 0)
        {
            insights.Add(new InsightDto(
                "on-track",
                "Tip",
                "You're on track",
                "Keep logging transactions to get personalized insights.",
                null,
                null));
        }

        return insights;
    }
}
