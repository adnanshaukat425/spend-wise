using MediatR;
using Microsoft.EntityFrameworkCore;
using SpendWise.Application.Common.Interfaces;
using SpendWise.Application.Common.Models;
using SpendWise.Domain.Enums;

namespace SpendWise.Application.Features.Insights;

public record GetInsightsQuery : IRequest<IReadOnlyList<InsightDto>>;

public class GetInsightsQueryHandler : IRequestHandler<GetInsightsQuery, IReadOnlyList<InsightDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IInsightGenerator _generator;

    public GetInsightsQueryHandler(ICurrentUserService currentUser, IInsightGenerator generator)
    {
        _currentUser = currentUser;
        _generator = generator;
    }

    public async Task<IReadOnlyList<InsightDto>> Handle(GetInsightsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        return await _generator.GenerateAsync(userId, cancellationToken);
    }
}

public record GetWeeklySpendQuery : IRequest<WeeklySpendDto>;

public class GetWeeklySpendQueryHandler : IRequestHandler<GetWeeklySpendQuery, WeeklySpendDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetWeeklySpendQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<WeeklySpendDto> Handle(GetWeeklySpendQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        var start = DateTime.UtcNow.Date.AddDays(-6);
        var txs = await _db.Transactions
            .Where(t => t.UserId == userId
                && t.OccurredAt >= start
                && t.Category.Type == CategoryType.Expense)
            .ToListAsync(cancellationToken);

        var dayNames = new[] { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };
        var days = new List<WeeklySpendDayDto>();

        for (var i = 0; i < 7; i++)
        {
            var day = start.AddDays(i);
            var amount = txs
                .Where(t => t.OccurredAt.Date == day)
                .Sum(t => Math.Abs(t.Amount));

            days.Add(new WeeklySpendDayDto
            {
                Day = dayNames[(int)day.DayOfWeek == 0 ? 6 : (int)day.DayOfWeek - 1],
                Amount = amount,
            });
        }

        return new WeeklySpendDto
        {
            Days = days,
            Total = days.Sum(d => d.Amount),
        };
    }
}
