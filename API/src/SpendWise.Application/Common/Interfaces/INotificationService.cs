namespace SpendWise.Application.Common.Interfaces;

public interface INotificationService
{
    Task PublishAsync(Guid userId, string title, string body, string iconKey, string iconColor, string iconBg, CancellationToken cancellationToken = default);
    Task CheckBudgetThresholdsAsync(Guid userId, Guid budgetPeriodId, CancellationToken cancellationToken = default);
}
