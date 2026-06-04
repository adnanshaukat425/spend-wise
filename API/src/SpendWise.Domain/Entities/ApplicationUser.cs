using Microsoft.AspNetCore.Identity;
using SpendWise.Domain.Enums;

namespace SpendWise.Domain.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    public string DisplayName { get; set; } = string.Empty;
    public SubscriptionTier SubscriptionTier { get; set; } = SubscriptionTier.Free;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public UserPreference? Preference { get; set; }
    public ICollection<Account> Accounts { get; set; } = [];
    public ICollection<MoneyTransaction> Transactions { get; set; } = [];
    public ICollection<BudgetPeriod> BudgetPeriods { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
    public ICollection<UserSubscription> Subscriptions { get; set; } = [];
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}
