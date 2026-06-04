using Microsoft.EntityFrameworkCore;
using SpendWise.Application.Common.Interfaces;
using SpendWise.Application.Common.Models;
using SpendWise.Domain.Entities;
using SpendWise.Domain.Enums;

namespace SpendWise.Application.Common;

public static class UserMapper
{
    public static string GetInitials(string displayName)
    {
        var parts = displayName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length >= 2)
        {
            return $"{parts[0][0]}{parts[^1][0]}".ToUpperInvariant();
        }

        return parts.Length == 1 && parts[0].Length > 0
            ? parts[0][..Math.Min(2, parts[0].Length)].ToUpperInvariant()
            : "??";
    }

    public static async Task<UserProfileDto> ToProfileDtoAsync(
        ApplicationUser user,
        IApplicationDbContext db,
        CancellationToken cancellationToken)
    {
        var txCount = await db.Transactions.CountAsync(t => t.UserId == user.Id, cancellationToken);
        var accountCount = await db.Accounts.CountAsync(a => a.UserId == user.Id && a.IsActive, cancellationToken);
        var currency = await db.UserPreferences
            .Where(p => p.UserId == user.Id)
            .Select(p => p.CurrencyCode)
            .FirstOrDefaultAsync(cancellationToken) ?? "USD";

        return new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            DisplayName = user.DisplayName,
            Initials = GetInitials(user.DisplayName),
            SubscriptionTier = user.SubscriptionTier.ToString(),
            TransactionCount = txCount,
            AccountCount = accountCount,
            CurrencyCode = currency,
        };
    }
}

public static class TransactionMapper
{
    public static TransactionDto ToDto(MoneyTransaction tx) => new()
    {
        Id = tx.Id,
        Name = tx.Name,
        Amount = tx.Amount,
        CategorySlug = tx.Category.Slug,
        CategoryName = tx.Category.Name,
        CategoryIconKey = tx.Category.IconKey,
        CategoryIconBg = tx.Category.IconBg,
        CategoryIconColor = tx.Category.IconColor,
        Type = tx.Category.Type.ToString(),
        AccountId = tx.AccountId,
        AccountName = tx.Account.Name,
        Note = tx.Note,
        ReceiptUrl = tx.ReceiptUrl,
        OccurredAt = tx.OccurredAt,
    };
}

public static class BudgetHelper
{
    public static (int Year, int Month) CurrentPeriod()
    {
        var now = DateTime.UtcNow;
        return (now.Year, now.Month);
    }

    public static async Task<BudgetPeriod?> GetOrCreateCurrentPeriodAsync(
        Guid userId,
        IApplicationDbContext db,
        CancellationToken cancellationToken)
    {
        var (year, month) = CurrentPeriod();
        var period = await db.BudgetPeriods
            .Include(p => p.Lines)
            .ThenInclude(l => l.Category)
            .FirstOrDefaultAsync(p => p.UserId == userId && p.Year == year && p.Month == month, cancellationToken);

        if (period != null)
        {
            return period;
        }

        var categories = await db.Categories
            .Where(c => c.Type == CategoryType.Expense)
            .OrderBy(c => c.SortOrder)
            .ToListAsync(cancellationToken);

        period = new BudgetPeriod
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Year = year,
            Month = month,
            TotalLimit = 2341m,
            Lines = categories.Select(c => new BudgetLine
            {
                Id = Guid.NewGuid(),
                CategoryId = c.Id,
                LimitAmount = DefaultLimitForSlug(c.Slug),
            }).ToList(),
        };

        db.BudgetPeriods.Add(period);
        await db.SaveChangesAsync(cancellationToken);

        return await db.BudgetPeriods
            .Include(p => p.Lines)
            .ThenInclude(l => l.Category)
            .FirstAsync(p => p.Id == period.Id, cancellationToken);
    }

    private static decimal DefaultLimitForSlug(string slug) => slug switch
    {
        "food" => 500m,
        "shopping" => 300m,
        "transport" => 200m,
        "coffee" => 100m,
        "bills" => 400m,
        _ => 150m,
    };

    public static async Task<Dictionary<Guid, decimal>> GetSpentByCategoryAsync(
        Guid userId,
        int year,
        int month,
        IApplicationDbContext db,
        CancellationToken cancellationToken)
    {
        var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = start.AddMonths(1);

        return await db.Transactions
            .Where(t => t.UserId == userId
                && t.OccurredAt >= start
                && t.OccurredAt < end
                && t.Category.Type == CategoryType.Expense)
            .GroupBy(t => t.CategoryId)
            .Select(g => new { CategoryId = g.Key, Spent = g.Sum(t => Math.Abs(t.Amount)) })
            .ToDictionaryAsync(x => x.CategoryId, x => x.Spent, cancellationToken);
    }

    public static BudgetSummaryDto ToSummaryDto(BudgetPeriod period, Dictionary<Guid, decimal> spentByCategory)
    {
        var lines = period.Lines.Select(line =>
        {
            var spent = spentByCategory.GetValueOrDefault(line.CategoryId, 0m);
            var pct = line.LimitAmount > 0 ? Math.Round(spent / line.LimitAmount * 100, 1) : 0;
            return new BudgetLineDto
            {
                CategoryId = line.CategoryId,
                CategorySlug = line.Category.Slug,
                CategoryName = line.Category.Name,
                IconKey = line.Category.IconKey,
                IconBg = line.Category.IconBg,
                IconColor = line.Category.IconColor,
                LimitAmount = line.LimitAmount,
                SpentAmount = spent,
                PercentUsed = pct,
            };
        }).ToList();

        var totalSpent = lines.Sum(l => l.SpentAmount);
        var totalLimit = period.TotalLimit > 0 ? period.TotalLimit : lines.Sum(l => l.LimitAmount);
        var percentUsed = totalLimit > 0 ? Math.Round(totalSpent / totalLimit * 100, 1) : 0;

        return new BudgetSummaryDto
        {
            Id = period.Id,
            Year = period.Year,
            Month = period.Month,
            TotalLimit = totalLimit,
            TotalSpent = totalSpent,
            PercentUsed = percentUsed,
            Lines = lines,
        };
    }
}
