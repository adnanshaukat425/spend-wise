using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendWise.Application.Common.Models;
using SpendWise.Application.Features.Transactions;

namespace SpendWise.Api.Controllers;

[ApiController]
[Route("api/transactions")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TransactionsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public Task<PagedResult<TransactionDto>> List(
        [FromQuery] string? categorySlug,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string? type,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20) =>
        _mediator.Send(new GetTransactionsQuery(categorySlug, from, to, type, page, pageSize));

    [HttpGet("{id:guid}")]
    public Task<TransactionDto> Get(Guid id) => _mediator.Send(new GetTransactionByIdQuery(id));

    [HttpPost]
    public Task<TransactionDto> Create([FromBody] CreateTransactionRequest request) =>
        _mediator.Send(new CreateTransactionCommand(
            request.AccountId, request.CategorySlug, request.Name, request.Amount,
            request.Note, request.ReceiptUrl, request.OccurredAt));

    [HttpPatch("{id:guid}")]
    public Task<TransactionDto> Update(Guid id, [FromBody] UpdateTransactionRequest request) =>
        _mediator.Send(new UpdateTransactionCommand(id, request.Name, request.Amount, request.Note, request.ReceiptUrl));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteTransactionCommand(id));
        return NoContent();
    }
}

public record CreateTransactionRequest(
    Guid AccountId, string CategorySlug, string Name, decimal Amount,
    string? Note, string? ReceiptUrl, DateTime? OccurredAt);

public record UpdateTransactionRequest(string? Name, decimal? Amount, string? Note, string? ReceiptUrl);
