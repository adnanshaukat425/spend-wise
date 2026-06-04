using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendWise.Application.Common.Models;
using SpendWise.Application.Features.Accounts;

namespace SpendWise.Api.Controllers;

[ApiController]
[Route("api/accounts")]
[Authorize]
public class AccountsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AccountsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public Task<IReadOnlyList<AccountDto>> List() => _mediator.Send(new GetAccountsQuery());

    [HttpPost]
    public Task<AccountDto> Create([FromBody] CreateAccountRequest request) =>
        _mediator.Send(new CreateAccountCommand(
            request.Name, request.AccountType, request.Balance,
            request.LastFourDigits, request.IconKey, request.IconColor));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteAccountCommand(id));
        return NoContent();
    }
}

public record CreateAccountRequest(
    string Name, string AccountType, decimal Balance,
    string LastFourDigits, string IconKey, string IconColor);

