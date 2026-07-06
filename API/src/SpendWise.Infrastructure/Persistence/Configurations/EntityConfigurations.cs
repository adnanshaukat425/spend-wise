using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpendWise.Domain.Entities;

namespace SpendWise.Infrastructure.Persistence.Configurations;

public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.Property(u => u.DisplayName).HasMaxLength(200).IsRequired();
        builder.Property(u => u.SubscriptionTier).HasConversion<string>().HasMaxLength(20);
    }
}

public class UserPreferenceConfiguration : IEntityTypeConfiguration<UserPreference>
{
    public void Configure(EntityTypeBuilder<UserPreference> builder)
    {
        builder.HasKey(p => p.UserId);
        builder.Property(p => p.CurrencyCode).HasMaxLength(3).IsRequired();
        builder.HasOne(p => p.User).WithOne(u => u.Preference).HasForeignKey<UserPreference>(p => p.UserId);
    }
}

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.HasIndex(c => c.Slug).IsUnique();
        builder.Property(c => c.Slug).HasMaxLength(50).IsRequired();
        builder.Property(c => c.Name).HasMaxLength(100).IsRequired();
        builder.Property(c => c.Type).HasConversion<string>().HasMaxLength(20);
    }
}

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.Property(a => a.Name).HasMaxLength(200).IsRequired();
        builder.Property(a => a.AccountType).HasConversion<string>().HasMaxLength(20);
        builder.Property(a => a.Balance).HasPrecision(18, 2);
        builder.HasIndex(a => new { a.UserId, a.IsDefault });
        builder.HasOne(a => a.User).WithMany(u => u.Accounts).HasForeignKey(a => a.UserId);
    }
}

public class MoneyTransactionConfiguration : IEntityTypeConfiguration<MoneyTransaction>
{
    public void Configure(EntityTypeBuilder<MoneyTransaction> builder)
    {
        builder.Property(t => t.Name).HasMaxLength(200).IsRequired();
        builder.Property(t => t.Amount).HasPrecision(18, 2);
        builder.HasIndex(t => new { t.UserId, t.OccurredAt });
        builder.HasOne(t => t.User).WithMany(u => u.Transactions).HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.NoAction);
        builder.HasOne(t => t.Account).WithMany(a => a.Transactions).HasForeignKey(t => t.AccountId).OnDelete(DeleteBehavior.NoAction);
        builder.HasOne(t => t.Category).WithMany(c => c.Transactions).HasForeignKey(t => t.CategoryId).OnDelete(DeleteBehavior.NoAction);
    }
}

public class BudgetPeriodConfiguration : IEntityTypeConfiguration<BudgetPeriod>
{
    public void Configure(EntityTypeBuilder<BudgetPeriod> builder)
    {
        builder.Property(b => b.TotalLimit).HasPrecision(18, 2);
        builder.HasIndex(b => new { b.UserId, b.Year, b.Month }).IsUnique();
        builder.HasOne(b => b.User).WithMany(u => u.BudgetPeriods).HasForeignKey(b => b.UserId).OnDelete(DeleteBehavior.NoAction);
    }
}

public class BudgetLineConfiguration : IEntityTypeConfiguration<BudgetLine>
{
    public void Configure(EntityTypeBuilder<BudgetLine> builder)
    {
        builder.Property(l => l.LimitAmount).HasPrecision(18, 2);
        builder.HasIndex(l => new { l.BudgetPeriodId, l.CategoryId }).IsUnique();
        builder.HasOne(l => l.BudgetPeriod).WithMany(p => p.Lines).HasForeignKey(l => l.BudgetPeriodId);
        builder.HasOne(l => l.Category).WithMany(c => c.BudgetLines).HasForeignKey(l => l.CategoryId);
    }
}

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.Property(n => n.Title).HasMaxLength(200).IsRequired();
        builder.HasOne(n => n.User).WithMany(u => u.Notifications).HasForeignKey(n => n.UserId).OnDelete(DeleteBehavior.NoAction);
    }
}

public class SubscriptionPlanConfiguration : IEntityTypeConfiguration<SubscriptionPlan>
{
    public void Configure(EntityTypeBuilder<SubscriptionPlan> builder)
    {
        builder.HasIndex(p => p.Slug).IsUnique();
        builder.Property(p => p.Price).HasPrecision(18, 2);
    }
}

public class UserSubscriptionConfiguration : IEntityTypeConfiguration<UserSubscription>
{
    public void Configure(EntityTypeBuilder<UserSubscription> builder)
    {
        builder.Property(s => s.Status).HasConversion<string>().HasMaxLength(20);
        builder.HasOne(s => s.User).WithMany(u => u.Subscriptions).HasForeignKey(s => s.UserId);
        builder.HasOne(s => s.Plan).WithMany(p => p.UserSubscriptions).HasForeignKey(s => s.PlanId);
    }
}

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.Property(r => r.TokenHash).HasMaxLength(128).IsRequired();
        builder.HasIndex(r => r.TokenHash);
        builder.HasOne(r => r.User).WithMany(u => u.RefreshTokens).HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.NoAction);
    }
}
