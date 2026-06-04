using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SpendWise.Application.Common;
using SpendWise.Application.Common.Interfaces;
using SpendWise.Application.Common.Models;
using SpendWise.Domain.Entities;
using SpendWise.Domain.Enums;

namespace SpendWise.Application.Features.Auth;

internal static class ExternalAuthHelper
{
    public static async Task<AuthTokenResponse> SignInExternalAsync(
        ExternalLoginPayload payload,
        UserManager<ApplicationUser> userManager,
        IApplicationDbContext db,
        IJwtTokenService jwt,
        CancellationToken cancellationToken)
    {
        var loginInfo = new UserLoginInfo(payload.Provider, payload.Subject, payload.Provider);
        var user = await userManager.FindByLoginAsync(payload.Provider, payload.Subject);

        if (user == null)
        {
            user = await userManager.FindByEmailAsync(payload.Email);
            if (user == null)
            {
                user = new ApplicationUser
                {
                    Id = Guid.NewGuid(),
                    UserName = payload.Email,
                    Email = payload.Email,
                    DisplayName = payload.Name ?? payload.Email.Split('@')[0],
                    EmailConfirmed = true,
                    SubscriptionTier = SubscriptionTier.Free,
                };
                var createResult = await userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    throw new InvalidOperationException(string.Join("; ", createResult.Errors.Select(e => e.Description)));
                }

                db.UserPreferences.Add(new UserPreference { UserId = user.Id });
                await db.SaveChangesAsync(cancellationToken);
            }

            await userManager.AddLoginAsync(user, loginInfo);
        }

        user.UpdatedAt = DateTime.UtcNow;
        await userManager.UpdateAsync(user);

        var refreshTokenPlain = jwt.GenerateRefreshToken();
        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = jwt.HashToken(refreshTokenPlain),
            ExpiresAt = DateTime.UtcNow.AddDays(30),
        };

        db.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync(cancellationToken);

        var accessToken = jwt.GenerateAccessToken(user.Id, user.Email!, user.DisplayName);
        var profile = await UserMapper.ToProfileDtoAsync(user, db, cancellationToken);

        return new AuthTokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenPlain,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = profile,
        };
    }
}

public record GoogleLoginCommand(string IdToken) : IRequest<AuthTokenResponse>;

public class GoogleLoginCommandHandler : IRequestHandler<GoogleLoginCommand, AuthTokenResponse>
{
    private readonly IGoogleTokenValidator _validator;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IApplicationDbContext _db;
    private readonly IJwtTokenService _jwt;

    public GoogleLoginCommandHandler(
        IGoogleTokenValidator validator,
        UserManager<ApplicationUser> userManager,
        IApplicationDbContext db,
        IJwtTokenService jwt)
    {
        _validator = validator;
        _userManager = userManager;
        _db = db;
        _jwt = jwt;
    }

    public async Task<AuthTokenResponse> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        var payload = await _validator.ValidateAsync(request.IdToken, cancellationToken)
            ?? throw new Common.Exceptions.UnauthorizedException("Invalid Google token.");

        return await ExternalAuthHelper.SignInExternalAsync(payload, _userManager, _db, _jwt, cancellationToken);
    }
}

public record AppleLoginCommand(string IdentityToken) : IRequest<AuthTokenResponse>;

public class AppleLoginCommandHandler : IRequestHandler<AppleLoginCommand, AuthTokenResponse>
{
    private readonly IAppleTokenValidator _validator;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IApplicationDbContext _db;
    private readonly IJwtTokenService _jwt;

    public AppleLoginCommandHandler(
        IAppleTokenValidator validator,
        UserManager<ApplicationUser> userManager,
        IApplicationDbContext db,
        IJwtTokenService jwt)
    {
        _validator = validator;
        _userManager = userManager;
        _db = db;
        _jwt = jwt;
    }

    public async Task<AuthTokenResponse> Handle(AppleLoginCommand request, CancellationToken cancellationToken)
    {
        var payload = await _validator.ValidateAsync(request.IdentityToken, cancellationToken)
            ?? throw new Common.Exceptions.UnauthorizedException("Invalid Apple token.");

        return await ExternalAuthHelper.SignInExternalAsync(payload, _userManager, _db, _jwt, cancellationToken);
    }
}

public record RefreshTokenCommand(string RefreshToken) : IRequest<AuthTokenResponse>;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthTokenResponse>
{
    private readonly IApplicationDbContext _db;
    private readonly IJwtTokenService _jwt;

    public RefreshTokenCommandHandler(IApplicationDbContext db, IJwtTokenService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<AuthTokenResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var hash = _jwt.HashToken(request.RefreshToken);
        var stored = await _db.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.TokenHash == hash && r.RevokedAt == null, cancellationToken)
            ?? throw new Common.Exceptions.UnauthorizedException("Invalid refresh token.");

        if (stored.IsExpired)
        {
            throw new Common.Exceptions.UnauthorizedException("Refresh token expired.");
        }

        stored.RevokedAt = DateTime.UtcNow;
        var newPlain = _jwt.GenerateRefreshToken();
        _db.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = stored.UserId,
            TokenHash = _jwt.HashToken(newPlain),
            ExpiresAt = DateTime.UtcNow.AddDays(30),
        });
        await _db.SaveChangesAsync(cancellationToken);

        var user = stored.User;
        var accessToken = _jwt.GenerateAccessToken(user.Id, user.Email!, user.DisplayName);
        var profile = await UserMapper.ToProfileDtoAsync(user, _db, cancellationToken);

        return new AuthTokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = newPlain,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = profile,
        };
    }
}

public record LogoutCommand(string? RefreshToken) : IRequest;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IJwtTokenService _jwt;

    public LogoutCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser, IJwtTokenService jwt)
    {
        _db = db;
        _currentUser = currentUser;
        _jwt = jwt;
    }

    public async Task Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            var hash = _jwt.HashToken(request.RefreshToken);
            var token = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.TokenHash == hash, cancellationToken);
            if (token != null)
            {
                token.RevokedAt = DateTime.UtcNow;
            }
        }
        else if (_currentUser.UserId.HasValue)
        {
            var tokens = await _db.RefreshTokens
                .Where(r => r.UserId == _currentUser.UserId && r.RevokedAt == null)
                .ToListAsync(cancellationToken);
            foreach (var t in tokens)
            {
                t.RevokedAt = DateTime.UtcNow;
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
    }
}

public record GetCurrentUserQuery : IRequest<UserProfileDto>;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, UserProfileDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetCurrentUserQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<UserProfileDto> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new Common.Exceptions.NotFoundException("User not found.");

        return await UserMapper.ToProfileDtoAsync(user, _db, cancellationToken);
    }
}
