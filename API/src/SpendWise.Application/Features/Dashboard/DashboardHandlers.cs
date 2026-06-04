using MediatR;
using Microsoft.EntityFrameworkCore;
using SpendWise.Application.Common;
using SpendWise.Application.Common.Interfaces;
using SpendWise.Application.Common.Models;

namespace SpendWise.Application.Features.Dashboard;

public record GetDashboardQuery : IRequest<DashboardDto>;

public class GetDashboardQueryHandler : IRequestHandler<GetDashboardQuery, DashboardDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetDashboardQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<DashboardDto> Handle(GetDashboardQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        var (year, month) = BudgetHelper.CurrentPeriod();
        var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = start.AddMonths(1);
        var prevStart = start.AddMonths(-1);

        var balance = await _db.Accounts
            .Where(a => a.UserId == userId && a.IsActive)
            .SumAsync(a => a.Balance, cancellationToken);

        var monthlyIncome = await _db.Transactions
            .Where(t => t.UserId == userId && t.OccurredAt >= start && t.OccurredAt < end && t.Amount > 0)
            .SumAsync(t => t.Amount, cancellationToken);

        var monthlyExpenses = await _db.Transactions
            .Where(t => t.UserId == userId && t.OccurredAt >= start && t.OccurredAt < end && t.Amount < 0)
            .SumAsync(t => Math.Abs(t.Amount), cancellationToken);

        var prevExpenses = await _db.Transactions
            .Where(t => t.UserId == userId && t.OccurredAt >= prevStart && t.OccurredAt < start && t.Amount < 0)
            .SumAsync(t => Math.Abs(t.Amount), cancellationToken);

        var balanceChangePct = prevExpenses > 0
            ? Math.Round((monthlyIncome - monthlyExpenses) / prevExpenses * 100, 1)
            : 0m;

        var spendingRaw = await _db.Transactions
            .Where(t => t.UserId == userId && t.OccurredAt >= start && t.OccurredAt < end && t.Amount < 0)
            .GroupBy(t => new { t.Category.Slug, t.Category.Name, t.Category.IconKey, t.Category.IconBg, t.Category.IconColor })
            .Select(g => new
            {
                g.Key.Slug,
                g.Key.Name,
                g.Key.IconKey,
                g.Key.IconBg,
                g.Key.IconColor,
                Amount = g.Sum(t => Math.Abs(t.Amount)),
            })
            .ToListAsync(cancellationToken);

        var totalSpend = spendingRaw.Sum(s => s.Amount);
        var segments = spendingRaw
            .OrderByDescending(s => s.Amount)
            .Select(s => new SpendingSegmentDto
            {
                CategorySlug = s.Slug,
                CategoryName = s.Name,
                IconKey = s.IconKey,
                IconBg = s.IconBg,
                IconColor = s.IconColor,
                Amount = s.Amount,
                Percent = totalSpend > 0 ? Math.Round(s.Amount / totalSpend * 100, 1) : 0,
            })
            .ToList();

        var recent = await _db.Transactions
            .Include(t => t.Category)
            .Include(t => t.Account)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.OccurredAt)
            .Take(5)
            .ToListAsync(cancellationToken);

        var period = await BudgetHelper.GetOrCreateCurrentPeriodAsync(userId, _db, cancellationToken);
        BudgetSummaryDto? budgetSummary = null;
        if (period != null)
        {
            var spent = await BudgetHelper.GetSpentByCategoryAsync(userId, year, month, _db, cancellationToken);
            budgetSummary = BudgetHelper.ToSummaryDto(period, spent);
        }

        return new DashboardDto
        {
            Balance = balance,
            BalanceChangePct = balanceChangePct,
            MonthlyIncome = monthlyIncome,
            MonthlyExpenses = monthlyExpenses,
            SpendingByCategory = segments,
            RecentTransactions = recent.Select(TransactionMapper.ToDto).ToList(),
            BudgetSummary = budgetSummary,
        };
    }
}
