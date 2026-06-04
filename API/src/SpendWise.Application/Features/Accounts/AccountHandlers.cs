using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SpendWise.Application.Common.Interfaces;
using SpendWise.Application.Common.Models;
using SpendWise.Domain.Entities;
using SpendWise.Domain.Enums;

namespace SpendWise.Application.Features.Accounts;

public record GetAccountsQuery : IRequest<IReadOnlyList<AccountDto>>;

public class GetAccountsQueryHandler : IRequestHandler<GetAccountsQuery, IReadOnlyList<AccountDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetAccountsQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<AccountDto>> Handle(GetAccountsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        return await _db.Accounts
            .Where(a => a.UserId == userId && a.IsActive)
            .OrderBy(a => a.Name)
            .Select(a => new AccountDto
            {
                Id = a.Id,
                Name = a.Name,
                AccountType = a.AccountType.ToString(),
                Balance = a.Balance,
                LastFourDigits = a.LastFourDigits,
                IconKey = a.IconKey,
                IconColor = a.IconColor,
            })
            .ToListAsync(cancellationToken);
    }
}

public record CreateAccountCommand(
    string Name,
    string AccountType,
    decimal Balance,
    string LastFourDigits,
    string IconKey,
    string IconColor) : IRequest<AccountDto>;

public class CreateAccountCommandValidator : AbstractValidator<CreateAccountCommand>
{
    public CreateAccountCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.AccountType).Must(t => Enum.TryParse<AccountType>(t, true, out _));
        RuleFor(x => x.LastFourDigits).MaximumLength(4);
    }
}

public class CreateAccountCommandHandler : IRequestHandler<CreateAccountCommand, AccountDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateAccountCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<AccountDto> Handle(CreateAccountCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        var account = new Account
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            AccountType = Enum.Parse<AccountType>(request.AccountType, true),
            Balance = request.Balance,
            LastFourDigits = request.LastFourDigits,
            IconKey = request.IconKey,
            IconColor = request.IconColor,
        };

        _db.Accounts.Add(account);
        await _db.SaveChangesAsync(cancellationToken);

        return new AccountDto
        {
            Id = account.Id,
            Name = account.Name,
            AccountType = account.AccountType.ToString(),
            Balance = account.Balance,
            LastFourDigits = account.LastFourDigits,
            IconKey = account.IconKey,
            IconColor = account.IconColor,
        };
    }
}

public record DeleteAccountCommand(Guid Id) : IRequest;

public class DeleteAccountCommandHandler : IRequestHandler<DeleteAccountCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteAccountCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task Handle(DeleteAccountCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        var account = await _db.Accounts.FirstOrDefaultAsync(
            a => a.Id == request.Id && a.UserId == userId, cancellationToken)
            ?? throw new Common.Exceptions.NotFoundException("Account not found.");

        account.IsActive = false;
        await _db.SaveChangesAsync(cancellationToken);
    }
}
