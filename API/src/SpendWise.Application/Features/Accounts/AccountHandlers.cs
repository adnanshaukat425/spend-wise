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
            .OrderByDescending(a => a.IsDefault)
            .ThenBy(a => a.Name)
            .Select(a => new AccountDto
            {
                Id = a.Id,
                Name = a.Name,
                AccountType = a.AccountType.ToString(),
                Balance = a.Balance,
                LastFourDigits = a.LastFourDigits,
                IconKey = a.IconKey,
                IconColor = a.IconColor,
                IsDefault = a.IsDefault,
                HasIncomeTransactions = a.Transactions.Any(t => t.Amount > 0),
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

        var hasActiveAccounts = await _db.Accounts.AnyAsync(
            a => a.UserId == userId && a.IsActive, cancellationToken);

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
            IsDefault = !hasActiveAccounts,
        };

        _db.Accounts.Add(account);
        await _db.SaveChangesAsync(cancellationToken);

        return AccountMapper.ToDto(account);
    }
}

public record GetAccountQuery(Guid Id) : IRequest<AccountDto>;

public class GetAccountQueryHandler : IRequestHandler<GetAccountQuery, AccountDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetAccountQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<AccountDto> Handle(GetAccountQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        var account = await _db.Accounts.FirstOrDefaultAsync(
            a => a.Id == request.Id && a.UserId == userId && a.IsActive, cancellationToken)
            ?? throw new Common.Exceptions.NotFoundException("Account not found.");

        return AccountMapper.ToDto(
            account,
            await _db.Transactions.AnyAsync(
                t => t.AccountId == account.Id && t.UserId == userId && t.Amount > 0,
                cancellationToken));
    }
}

public record UpdateAccountCommand(
    Guid Id,
    string Name,
    string AccountType,
    decimal Balance,
    string LastFourDigits,
    string IconKey,
    string IconColor) : IRequest<AccountDto>;

public class UpdateAccountCommandValidator : AbstractValidator<UpdateAccountCommand>
{
    public UpdateAccountCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.AccountType).Must(t => Enum.TryParse<AccountType>(t, true, out _));
        RuleFor(x => x.LastFourDigits).MaximumLength(4);
    }
}

public class UpdateAccountCommandHandler : IRequestHandler<UpdateAccountCommand, AccountDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateAccountCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<AccountDto> Handle(UpdateAccountCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        var account = await _db.Accounts.FirstOrDefaultAsync(
            a => a.Id == request.Id && a.UserId == userId && a.IsActive, cancellationToken)
            ?? throw new Common.Exceptions.NotFoundException("Account not found.");

        account.Name = request.Name;
        account.AccountType = Enum.Parse<AccountType>(request.AccountType, true);
        account.Balance = request.Balance;
        account.LastFourDigits = request.LastFourDigits;
        account.IconKey = request.IconKey;
        account.IconColor = request.IconColor;

        await _db.SaveChangesAsync(cancellationToken);

        return AccountMapper.ToDto(account);
    }
}

public record SetDefaultAccountCommand(Guid Id) : IRequest<AccountDto>;

public class SetDefaultAccountCommandHandler : IRequestHandler<SetDefaultAccountCommand, AccountDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public SetDefaultAccountCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<AccountDto> Handle(SetDefaultAccountCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        var account = await _db.Accounts.FirstOrDefaultAsync(
            a => a.Id == request.Id && a.UserId == userId && a.IsActive, cancellationToken)
            ?? throw new Common.Exceptions.NotFoundException("Account not found.");

        var activeAccounts = await _db.Accounts
            .Where(a => a.UserId == userId && a.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var activeAccount in activeAccounts)
        {
            activeAccount.IsDefault = activeAccount.Id == account.Id;
        }

        await _db.SaveChangesAsync(cancellationToken);

        return AccountMapper.ToDto(account);
    }
}

public record DeleteAccountCommand(Guid Id, bool TransferIncome) : IRequest;

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
            a => a.Id == request.Id && a.UserId == userId && a.IsActive, cancellationToken)
            ?? throw new Common.Exceptions.NotFoundException("Account not found.");

        if (account.IsDefault)
        {
            throw new Common.Exceptions.ValidationException(new Dictionary<string, string[]>
            {
                ["account"] = ["Cannot delete the default account. Set another account as default first."],
            });
        }

        var defaultAccount = await _db.Accounts.FirstOrDefaultAsync(
            a => a.UserId == userId && a.IsActive && a.IsDefault, cancellationToken)
            ?? throw new Common.Exceptions.NotFoundException("Default account not found.");

        var transactions = await _db.Transactions
            .Where(t => t.AccountId == account.Id && t.UserId == userId)
            .ToListAsync(cancellationToken);

        foreach (var tx in transactions)
        {
            var isExpense = tx.Amount < 0;
            var isIncome = tx.Amount > 0;

            if (isExpense || (request.TransferIncome && isIncome))
            {
                defaultAccount.Balance += tx.Amount;
                tx.AccountId = defaultAccount.Id;
            }
        }

        account.IsActive = false;
        account.IsDefault = false;
        await _db.SaveChangesAsync(cancellationToken);
    }
}

internal static class AccountMapper
{
    public static AccountDto ToDto(Account account, bool hasIncomeTransactions = false) => new()
    {
        Id = account.Id,
        Name = account.Name,
        AccountType = account.AccountType.ToString(),
        Balance = account.Balance,
        LastFourDigits = account.LastFourDigits,
        IconKey = account.IconKey,
        IconColor = account.IconColor,
        IsDefault = account.IsDefault,
        HasIncomeTransactions = hasIncomeTransactions,
    };
}
