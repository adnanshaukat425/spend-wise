namespace SpendWise.Domain.Entities;

public class UserPreference
{
    public Guid UserId { get; set; }
    public bool NotificationsEnabled { get; set; } = true;
    public string CurrencyCode { get; set; } = "USD";

    public ApplicationUser User { get; set; } = null!;
}
