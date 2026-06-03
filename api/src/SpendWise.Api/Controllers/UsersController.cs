using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendWise.Application.Common.Models;
using SpendWise.Application.Features.Users;

namespace SpendWise.Api.Controllers;

[ApiController]
[Route("api/users/me")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public Task<UserProfileDto> GetProfile() => _mediator.Send(new GetUserProfileQuery());

    [HttpPatch]
    public Task<UserProfileDto> UpdateProfile([FromBody] UpdateProfileRequest request) =>
        _mediator.Send(new UpdateUserProfileCommand(request.DisplayName));

    [HttpGet("preferences")]
    public Task<UserPreferencesDto> GetPreferences() => _mediator.Send(new GetUserPreferencesQuery());

    [HttpPatch("preferences")]
    public Task<UserPreferencesDto> UpdatePreferences([FromBody] UpdatePreferencesRequest request) =>
        _mediator.Send(new UpdateUserPreferencesCommand(request.NotificationsEnabled, request.CurrencyCode));
}

public record UpdateProfileRequest(string DisplayName);
public record UpdatePreferencesRequest(bool? NotificationsEnabled, string? CurrencyCode);
