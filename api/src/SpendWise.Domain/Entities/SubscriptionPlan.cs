namespace SpendWise.Domain.Entities;

public class SubscriptionPlan
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string BillingPeriod { get; set; } = string.Empty;
    public string? Badge { get; set; }
    public string? Tag { get; set; }
    public bool IsPopular { get; set; }
    public string FeaturesJson { get; set; } = "[]";
    public int SortOrder { get; set; }

    public ICollection<UserSubscription> UserSubscriptions { get; set; } = [];
}
