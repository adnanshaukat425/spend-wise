using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendWise.Application.Common.Models;
using SpendWise.Application.Features.Users;

namespace SpendWise.Api.Controllers;

[ApiController]
[Route("api/users/me/preferences")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public Task<UserPreferencesDto> GetPreferences() => _mediator.Send(new GetUserPreferencesQuery());

    [HttpPatch]
    public Task<UserPreferencesDto> UpdatePreferences([FromBody] UpdatePreferencesRequest request) =>
        _mediator.Send(new UpdateUserPreferencesCommand(request.NotificationsEnabled, request.CurrencyCode));
}

public record UpdatePreferencesRequest(bool? NotificationsEnabled, string? CurrencyCode);
