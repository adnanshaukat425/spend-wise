using Microsoft.EntityFrameworkCore;
using SpendWise.Domain.Entities;

namespace SpendWise.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<ApplicationUser> Users { get; }
    DbSet<UserPreference> UserPreferences { get; }
    DbSet<Category> Categories { get; }
    DbSet<Account> Accounts { get; }
    DbSet<MoneyTransaction> Transactions { get; }
    DbSet<BudgetPeriod> BudgetPeriods { get; }
    DbSet<BudgetLine> BudgetLines { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<SubscriptionPlan> SubscriptionPlans { get; }
    DbSet<UserSubscription> UserSubscriptions { get; }
    DbSet<RefreshToken> RefreshTokens { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
