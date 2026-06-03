using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SpendWise.Application.Common;
using SpendWise.Application.Common.Interfaces;
using SpendWise.Application.Common.Models;
using SpendWise.Domain.Entities;

namespace SpendWise.Application.Features.Users;

public record GetUserProfileQuery : IRequest<UserProfileDto>;

public class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, UserProfileDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetUserProfileQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<UserProfileDto> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");
        var user = await _db.Users.FirstAsync(u => u.Id == userId, cancellationToken);
        return await UserMapper.ToProfileDtoAsync(user, _db, cancellationToken);
    }
}

public record UpdateUserProfileCommand(string DisplayName) : IRequest<UserProfileDto>;

public class UpdateUserProfileCommandValidator : AbstractValidator<UpdateUserProfileCommand>
{
    public UpdateUserProfileCommandValidator()
    {
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(200);
    }
}

public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, UserProfileDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateUserProfileCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<UserProfileDto> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");
        var user = await _db.Users.FirstAsync(u => u.Id == userId, cancellationToken);
        user.DisplayName = request.DisplayName;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return await UserMapper.ToProfileDtoAsync(user, _db, cancellationToken);
    }
}

public record GetUserPreferencesQuery : IRequest<UserPreferencesDto>;

public class GetUserPreferencesQueryHandler : IRequestHandler<GetUserPreferencesQuery, UserPreferencesDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetUserPreferencesQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<UserPreferencesDto> Handle(GetUserPreferencesQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");
        var pref = await _db.UserPreferences.FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken)
            ?? new UserPreference { UserId = userId };

        return new UserPreferencesDto
        {
            NotificationsEnabled = pref.NotificationsEnabled,
            CurrencyCode = pref.CurrencyCode,
        };
    }
}

public record UpdateUserPreferencesCommand(bool? NotificationsEnabled, string? CurrencyCode) : IRequest<UserPreferencesDto>;

public class UpdateUserPreferencesCommandValidator : AbstractValidator<UpdateUserPreferencesCommand>
{
    public UpdateUserPreferencesCommandValidator()
    {
        RuleFor(x => x.CurrencyCode).Length(3).When(x => x.CurrencyCode != null);
    }
}

public class UpdateUserPreferencesCommandHandler : IRequestHandler<UpdateUserPreferencesCommand, UserPreferencesDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateUserPreferencesCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<UserPreferencesDto> Handle(UpdateUserPreferencesCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");
        var pref = await _db.UserPreferences.FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        if (pref == null)
        {
            pref = new UserPreference { UserId = userId };
            _db.UserPreferences.Add(pref);
        }

        if (request.NotificationsEnabled.HasValue)
        {
            pref.NotificationsEnabled = request.NotificationsEnabled.Value;
        }

        if (!string.IsNullOrWhiteSpace(request.CurrencyCode))
        {
            pref.CurrencyCode = request.CurrencyCode.ToUpperInvariant();
        }

        await _db.SaveChangesAsync(cancellationToken);
        return new UserPreferencesDto
        {
            NotificationsEnabled = pref.NotificationsEnabled,
            CurrencyCode = pref.CurrencyCode,
        };
    }
}
