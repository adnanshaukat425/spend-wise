using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendWise.Application.Common.Models;
using SpendWise.Application.Features.Budget;

namespace SpendWise.Api.Controllers;

[ApiController]
[Route("api/budgets")]
[Authorize]
public class BudgetsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BudgetsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("current")]
    public Task<BudgetSummaryDto> GetCurrent() => _mediator.Send(new GetCurrentBudgetQuery());

    [HttpPut("current/lines")]
    public Task<BudgetSummaryDto> UpdateLines([FromBody] UpdateBudgetLinesRequest request) =>
        _mediator.Send(new UpdateBudgetLinesCommand(
            request.Lines.Select(l => new BudgetLineUpdate(l.CategoryId, l.LimitAmount)).ToList()));

    [HttpPut("current/total")]
    public Task<BudgetSummaryDto> UpdateTotal([FromBody] UpdateBudgetTotalRequest request) =>
        _mediator.Send(new UpdateBudgetTotalCommand(request.TotalLimit));
}

public record UpdateBudgetLinesRequest(IReadOnlyList<BudgetLineUpdateRequest> Lines);
public record BudgetLineUpdateRequest(Guid CategoryId, decimal LimitAmount);
public record UpdateBudgetTotalRequest(decimal TotalLimit);
