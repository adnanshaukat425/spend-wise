using SpendWise.Domain.Common;

namespace SpendWise.Domain.Entities;

public class MoneyTransaction : AuditableEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid AccountId { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Note { get; set; }
    public string? ReceiptUrl { get; set; }
    public DateTime OccurredAt { get; set; }

    public ApplicationUser User { get; set; } = null!;
    public Account Account { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
