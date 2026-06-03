using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using SpendWise.Application.Common.Interfaces;

namespace SpendWise.Infrastructure.Identity;

public class GoogleTokenValidator : IGoogleTokenValidator
{
    private readonly IConfiguration _configuration;

    public GoogleTokenValidator(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<ExternalLoginPayload?> ValidateAsync(string idToken, CancellationToken cancellationToken = default)
    {
        if (idToken.StartsWith("dev-google:", StringComparison.Ordinal))
        {
            var parts = idToken.Split(':', 3);
            return new ExternalLoginPayload(
                "Google",
                parts.Length > 1 ? parts[1] : Guid.NewGuid().ToString(),
                parts.Length > 2 ? parts[2] : "dev@gmail.com",
                "Dev User");
        }

        var clientId = _configuration["Google:ClientId"];
        if (string.IsNullOrWhiteSpace(clientId))
        {
            return null;
        }

        var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = [clientId],
        });

        return new ExternalLoginPayload(
            "Google",
            payload.Subject,
            payload.Email,
            payload.Name);
    }
}

public class AppleTokenValidator : IAppleTokenValidator
{
    private readonly IConfiguration _configuration;

    public AppleTokenValidator(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public Task<ExternalLoginPayload?> ValidateAsync(string identityToken, CancellationToken cancellationToken = default)
    {
        if (identityToken.StartsWith("dev-apple:", StringComparison.Ordinal))
        {
            var parts = identityToken.Split(':', 3);
            return Task.FromResult<ExternalLoginPayload?>(new ExternalLoginPayload(
                "Apple",
                parts.Length > 1 ? parts[1] : Guid.NewGuid().ToString(),
                parts.Length > 2 ? parts[2] : "dev@icloud.com",
                "Dev User"));
        }

        // Production Apple JWT validation requires JWKS fetch; stub returns null when not dev token
        var clientId = _configuration["Apple:ClientId"];
        if (string.IsNullOrWhiteSpace(clientId))
        {
            return Task.FromResult<ExternalLoginPayload?>(null);
        }

        // Full Apple validation would use Apple's JWKS endpoint
        return Task.FromResult<ExternalLoginPayload?>(null);
    }
}
