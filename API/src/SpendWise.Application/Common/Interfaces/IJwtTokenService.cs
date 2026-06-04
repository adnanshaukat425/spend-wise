namespace SpendWise.Application.Common.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(Guid userId, string email, string displayName);
    string GenerateRefreshToken();
    string HashToken(string token);
}
