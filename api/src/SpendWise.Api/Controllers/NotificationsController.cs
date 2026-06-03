using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendWise.Application.Common.Models;
using SpendWise.Application.Features.Notifications;
using SpendWise.Application.Features.Subscriptions;

namespace SpendWise.Api.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public Task<PagedResult<NotificationDto>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20) =>
        _mediator.Send(new GetNotificationsQuery(page, pageSize));

    [HttpPatch("{id:guid}/read")]
    public Task<NotificationDto> MarkRead(Guid id) => _mediator.Send(new MarkNotificationReadCommand(id));

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        await _mediator.Send(new MarkAllNotificationsReadCommand());
        return NoContent();
    }
}

[ApiController]
[Route("api/subscriptions")]
public class SubscriptionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SubscriptionsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("plans")]
    [AllowAnonymous]
    public Task<IReadOnlyList<SubscriptionPlanDto>> Plans() => _mediator.Send(new GetSubscriptionPlansQuery());

    [HttpGet("me")]
    [Authorize]
    public Task<UserSubscriptionDto> Me() => _mediator.Send(new GetUserSubscriptionQuery());

    [HttpPost("start-trial")]
    [Authorize]
    public Task<UserSubscriptionDto> StartTrial() => _mediator.Send(new StartTrialCommand());
}
