namespace SpendWise.Application.Common.Models;

public class AuthTokenResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserProfileDto User { get; set; } = null!;
}

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Initials { get; set; } = string.Empty;
    public string SubscriptionTier { get; set; } = string.Empty;
    public int TransactionCount { get; set; }
    public int AccountCount { get; set; }
    public string CurrencyCode { get; set; } = "USD";
}

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string IconKey { get; set; } = string.Empty;
    public string IconBg { get; set; } = string.Empty;
    public string IconColor { get; set; } = string.Empty;
}

public class AccountDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string AccountType { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public string LastFourDigits { get; set; } = string.Empty;
    public string IconKey { get; set; } = string.Empty;
    public string IconColor { get; set; } = string.Empty;
}

public class TransactionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CategorySlug { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryIconKey { get; set; } = string.Empty;
    public string CategoryIconBg { get; set; } = string.Empty;
    public string CategoryIconColor { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public Guid AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string? Note { get; set; }
    public string? ReceiptUrl { get; set; }
    public DateTime OccurredAt { get; set; }
}

public class BudgetLineDto
{
    public Guid CategoryId { get; set; }
    public string CategorySlug { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string IconKey { get; set; } = string.Empty;
    public string IconBg { get; set; } = string.Empty;
    public string IconColor { get; set; } = string.Empty;
    public decimal LimitAmount { get; set; }
    public decimal SpentAmount { get; set; }
    public decimal PercentUsed { get; set; }
}

public class BudgetSummaryDto
{
    public Guid Id { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal TotalLimit { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal PercentUsed { get; set; }
    public IReadOnlyList<BudgetLineDto> Lines { get; set; } = [];
}

public class DashboardDto
{
    public decimal Balance { get; set; }
    public decimal BalanceChangePct { get; set; }
    public decimal MonthlyIncome { get; set; }
    public decimal MonthlyExpenses { get; set; }
    public IReadOnlyList<SpendingSegmentDto> SpendingByCategory { get; set; } = [];
    public IReadOnlyList<TransactionDto> RecentTransactions { get; set; } = [];
    public BudgetSummaryDto? BudgetSummary { get; set; }
}

public class SpendingSegmentDto
{
    public string CategorySlug { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string IconKey { get; set; } = string.Empty;
    public string IconBg { get; set; } = string.Empty;
    public string IconColor { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal Percent { get; set; }
}

public class WeeklySpendDto
{
    public IReadOnlyList<WeeklySpendDayDto> Days { get; set; } = [];
    public decimal Total { get; set; }
}

public class WeeklySpendDayDto
{
    public string Day { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class NotificationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public string IconKey { get; set; } = string.Empty;
    public string IconColor { get; set; } = string.Empty;
    public string IconBg { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class SubscriptionPlanDto
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string BillingPeriod { get; set; } = string.Empty;
    public string? Badge { get; set; }
    public string? Tag { get; set; }
    public bool IsPopular { get; set; }
    public IReadOnlyList<string> Features { get; set; } = [];
}

public class UserSubscriptionDto
{
    public string Tier { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? PlanName { get; set; }
    public DateTime? TrialEndsAt { get; set; }
}

public class UserPreferencesDto
{
    public bool NotificationsEnabled { get; set; }
    public string CurrencyCode { get; set; } = "USD";
}

public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; set; } = [];
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
}
