using MediatR;
using Microsoft.EntityFrameworkCore;
using SpendWise.Application.Common.Interfaces;
using SpendWise.Application.Common.Models;
using SpendWise.Domain.Enums;

namespace SpendWise.Application.Features.Subscriptions;

public record GetSubscriptionPlansQuery : IRequest<IReadOnlyList<SubscriptionPlanDto>>;

public class GetSubscriptionPlansQueryHandler : IRequestHandler<GetSubscriptionPlansQuery, IReadOnlyList<SubscriptionPlanDto>>
{
    private readonly IApplicationDbContext _db;

    public GetSubscriptionPlansQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<SubscriptionPlanDto>> Handle(
        GetSubscriptionPlansQuery request,
        CancellationToken cancellationToken)
    {
        var plans = await _db.SubscriptionPlans.OrderBy(p => p.SortOrder).ToListAsync(cancellationToken);
        return plans.Select(p => new SubscriptionPlanDto
        {
            Id = p.Id,
            Slug = p.Slug,
            Name = p.Name,
            Price = p.Price,
            BillingPeriod = p.BillingPeriod,
            Badge = p.Badge,
            Tag = p.Tag,
            IsPopular = p.IsPopular,
            Features = System.Text.Json.JsonSerializer.Deserialize<string[]>(p.FeaturesJson) ?? [],
        }).ToList();
    }
}

public record StartTrialCommand : IRequest<UserSubscriptionDto>;

public class StartTrialCommandHandler : IRequestHandler<StartTrialCommand, UserSubscriptionDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public StartTrialCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<UserSubscriptionDto> Handle(StartTrialCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        var plan = await _db.SubscriptionPlans.FirstAsync(p => p.Slug == "yearly", cancellationToken);
        var user = await _db.Users.FirstAsync(u => u.Id == userId, cancellationToken);

        user.SubscriptionTier = SubscriptionTier.Pro;
        user.UpdatedAt = DateTime.UtcNow;

        var sub = new Domain.Entities.UserSubscription
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PlanId = plan.Id,
            Status = SubscriptionStatus.Trial,
            StartedAt = DateTime.UtcNow,
            TrialEndsAt = DateTime.UtcNow.AddDays(14),
        };

        _db.UserSubscriptions.Add(sub);
        await _db.SaveChangesAsync(cancellationToken);

        return new UserSubscriptionDto
        {
            Tier = user.SubscriptionTier.ToString(),
            Status = sub.Status.ToString(),
            PlanName = plan.Name,
            TrialEndsAt = sub.TrialEndsAt,
        };
    }
}
