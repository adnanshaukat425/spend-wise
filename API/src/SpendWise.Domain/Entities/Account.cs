using SpendWise.Domain.Common;
using SpendWise.Domain.Enums;

namespace SpendWise.Domain.Entities;

public class Account : AuditableEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public AccountType AccountType { get; set; } = AccountType.Checking;
    public decimal Balance { get; set; }
    public string LastFourDigits { get; set; } = string.Empty;
    public string IconKey { get; set; } = string.Empty;
    public string IconColor { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ApplicationUser User { get; set; } = null!;
    public ICollection<MoneyTransaction> Transactions { get; set; } = [];
}
