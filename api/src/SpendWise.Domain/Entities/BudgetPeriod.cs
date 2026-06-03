using SpendWise.Domain.Common;

namespace SpendWise.Domain.Entities;

public class BudgetPeriod : AuditableEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal TotalLimit { get; set; }

    public ApplicationUser User { get; set; } = null!;
    public ICollection<BudgetLine> Lines { get; set; } = [];
}
