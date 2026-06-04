using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendWise.Application.Common.Interfaces;
using SpendWise.Application.Common.Models;
using SpendWise.Application.Features.Dashboard;
using SpendWise.Application.Features.Insights;

namespace SpendWise.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;

    public DashboardController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public Task<DashboardDto> Get() => _mediator.Send(new GetDashboardQuery());
}

[ApiController]
[Route("api/insights")]
[Authorize]
public class InsightsController : ControllerBase
{
    private readonly IMediator _mediator;

    public InsightsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public Task<IReadOnlyList<InsightDto>> List() => _mediator.Send(new GetInsightsQuery());

    [HttpGet("weekly-spend")]
    public Task<WeeklySpendDto> WeeklySpend() => _mediator.Send(new GetWeeklySpendQuery());
}
