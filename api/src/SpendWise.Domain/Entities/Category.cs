using SpendWise.Domain.Common;
using SpendWise.Domain.Enums;

namespace SpendWise.Domain.Entities;

public class Category : AuditableEntity
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public CategoryType Type { get; set; } = CategoryType.Expense;
    public string IconKey { get; set; } = string.Empty;
    public string IconBg { get; set; } = string.Empty;
    public string IconColor { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    public ICollection<MoneyTransaction> Transactions { get; set; } = [];
    public ICollection<BudgetLine> BudgetLines { get; set; } = [];
}
