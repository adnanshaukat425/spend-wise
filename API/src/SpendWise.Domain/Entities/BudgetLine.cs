namespace SpendWise.Domain.Entities;

public class BudgetLine
{
    public Guid Id { get; set; }
    public Guid BudgetPeriodId { get; set; }
    public Guid CategoryId { get; set; }
    public decimal LimitAmount { get; set; }

    public BudgetPeriod BudgetPeriod { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
