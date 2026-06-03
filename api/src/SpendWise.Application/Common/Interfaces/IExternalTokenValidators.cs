namespace SpendWise.Application.Common.Interfaces;

public interface IGoogleTokenValidator
{
    Task<ExternalLoginPayload?> ValidateAsync(string idToken, CancellationToken cancellationToken = default);
}

public interface IAppleTokenValidator
{
    Task<ExternalLoginPayload?> ValidateAsync(string identityToken, CancellationToken cancellationToken = default);
}

public record ExternalLoginPayload(string Provider, string Subject, string Email, string? Name);
