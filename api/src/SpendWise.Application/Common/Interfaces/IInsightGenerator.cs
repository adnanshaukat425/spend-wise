namespace SpendWise.Application.Common.Interfaces;

public interface IInsightGenerator
{
    Task<IReadOnlyList<InsightDto>> GenerateAsync(Guid userId, CancellationToken cancellationToken = default);
}

public record InsightDto(
    string Id,
    string Type,
    string Title,
    string Description,
    string? ActionLabel,
    string? ActionRoute);
