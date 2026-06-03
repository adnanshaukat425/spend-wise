using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendWise.Application.Common.Models;
using SpendWise.Application.Features.Auth;

namespace SpendWise.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator) => _mediator = mediator;

    [HttpPost("google")]
    [AllowAnonymous]
    public Task<AuthTokenResponse> Google([FromBody] GoogleLoginRequest request) =>
        _mediator.Send(new GoogleLoginCommand(request.IdToken));

    [HttpPost("apple")]
    [AllowAnonymous]
    public Task<AuthTokenResponse> Apple([FromBody] AppleLoginRequest request) =>
        _mediator.Send(new AppleLoginCommand(request.IdentityToken));

    [HttpPost("refresh")]
    [AllowAnonymous]
    public Task<AuthTokenResponse> Refresh([FromBody] RefreshRequest request) =>
        _mediator.Send(new RefreshTokenCommand(request.RefreshToken));

    [HttpGet("me")]
    [Authorize]
    public Task<UserProfileDto> Me() => _mediator.Send(new GetCurrentUserQuery());

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest? request)
    {
        await _mediator.Send(new LogoutCommand(request?.RefreshToken));
        return NoContent();
    }
}

public record GoogleLoginRequest(string IdToken);
public record AppleLoginRequest(string IdentityToken);
public record RefreshRequest(string RefreshToken);
public record LogoutRequest(string? RefreshToken);
