using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SpendWise.Application.Common;
using SpendWise.Application.Common.Interfaces;
using SpendWise.Application.Common.Models;
using SpendWise.Domain.Entities;
using SpendWise.Domain.Enums;

namespace SpendWise.Application.Features.Transactions;

public record GetTransactionsQuery(
    string? CategorySlug,
    DateTime? From,
    DateTime? To,
    string? Type,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<TransactionDto>>;

public class GetTransactionsQueryHandler : IRequestHandler<GetTransactionsQuery, PagedResult<TransactionDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetTransactionsQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<TransactionDto>> Handle(GetTransactionsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        var query = _db.Transactions
            .Include(t => t.Category)
            .Include(t => t.Account)
            .Where(t => t.UserId == userId);

        if (!string.IsNullOrWhiteSpace(request.CategorySlug))
        {
            query = query.Where(t => t.Category.Slug == request.CategorySlug);
        }

        if (request.From.HasValue)
        {
            query = query.Where(t => t.OccurredAt >= request.From.Value);
        }

        if (request.To.HasValue)
        {
            query = query.Where(t => t.OccurredAt <= request.To.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Type)
            && Enum.TryParse<CategoryType>(request.Type, true, out var type))
        {
            query = query.Where(t => t.Category.Type == type);
        }

        var total = await query.CountAsync(cancellationToken);
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var items = await query
            .OrderByDescending(t => t.OccurredAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<TransactionDto>
        {
            Items = items.Select(TransactionMapper.ToDto).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = total,
        };
    }
}

public record GetTransactionByIdQuery(Guid Id) : IRequest<TransactionDto>;

public class GetTransactionByIdQueryHandler : IRequestHandler<GetTransactionByIdQuery, TransactionDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetTransactionByIdQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<TransactionDto> Handle(GetTransactionByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        var tx = await _db.Transactions
            .Include(t => t.Category)
            .Include(t => t.Account)
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.UserId == userId, cancellationToken)
            ?? throw new Common.Exceptions.NotFoundException("Transaction not found.");

        return TransactionMapper.ToDto(tx);
    }
}

public record CreateTransactionCommand(
    Guid AccountId,
    string CategorySlug,
    string Name,
    decimal Amount,
    string? Note,
    string? ReceiptUrl,
    DateTime? OccurredAt) : IRequest<TransactionDto>;

public class CreateTransactionCommandValidator : AbstractValidator<CreateTransactionCommand>
{
    public CreateTransactionCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.CategorySlug).NotEmpty();
        RuleFor(x => x.Amount).NotEqual(0);
        RuleFor(x => x.AccountId).NotEmpty();
    }
}

public class CreateTransactionCommandHandler : IRequestHandler<CreateTransactionCommand, TransactionDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notifications;

    public CreateTransactionCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser,
        INotificationService notifications)
    {
        _db = db;
        _currentUser = currentUser;
        _notifications = notifications;
    }

    public async Task<TransactionDto> Handle(CreateTransactionCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        var account = await _db.Accounts.FirstOrDefaultAsync(
            a => a.Id == request.AccountId && a.UserId == userId && a.IsActive, cancellationToken)
            ?? throw new Common.Exceptions.NotFoundException("Account not found.");

        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Slug == request.CategorySlug, cancellationToken)
            ?? throw new Common.Exceptions.NotFoundException("Category not found.");

        var signedAmount = category.Type == CategoryType.Income
            ? Math.Abs(request.Amount)
            : -Math.Abs(request.Amount);

        var tx = new MoneyTransaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AccountId = account.Id,
            CategoryId = category.Id,
            Name = request.Name,
            Amount = signedAmount,
            Note = request.Note,
            ReceiptUrl = request.ReceiptUrl,
            OccurredAt = request.OccurredAt ?? DateTime.UtcNow,
        };

        account.Balance += signedAmount;
        _db.Transactions.Add(tx);
        await _db.SaveChangesAsync(cancellationToken);

        await _notifications.PublishAsync(
            userId,
            "Transaction recorded",
            $"{request.Name} for ${Math.Abs(signedAmount):F2} was added.",
            category.IconKey,
            category.IconColor,
            category.IconBg,
            cancellationToken);

        if (category.Type == CategoryType.Expense)
        {
            var period = await BudgetHelper.GetOrCreateCurrentPeriodAsync(userId, _db, cancellationToken);
            if (period != null)
            {
                await _notifications.CheckBudgetThresholdsAsync(userId, period.Id, cancellationToken);
            }
        }

        tx.Category = category;
        tx.Account = account;
        return TransactionMapper.ToDto(tx);
    }
}

public record UpdateTransactionCommand(
    Guid Id,
    string? Name,
    decimal? Amount,
    string? Note,
    string? ReceiptUrl) : IRequest<TransactionDto>;

public class UpdateTransactionCommandHandler : IRequestHandler<UpdateTransactionCommand, TransactionDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateTransactionCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<TransactionDto> Handle(UpdateTransactionCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        var tx = await _db.Transactions
            .Include(t => t.Category)
            .Include(t => t.Account)
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.UserId == userId, cancellationToken)
            ?? throw new Common.Exceptions.NotFoundException("Transaction not found.");

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            tx.Name = request.Name;
        }

        if (request.Amount.HasValue && request.Amount.Value != 0)
        {
            var delta = request.Amount.Value - tx.Amount;
            tx.Amount = request.Amount.Value;
            tx.Account.Balance += delta;
        }

        if (request.Note != null)
        {
            tx.Note = request.Note;
        }

        if (request.ReceiptUrl != null)
        {
            tx.ReceiptUrl = request.ReceiptUrl;
        }

        await _db.SaveChangesAsync(cancellationToken);
        return TransactionMapper.ToDto(tx);
    }
}

public record DeleteTransactionCommand(Guid Id) : IRequest;

public class DeleteTransactionCommandHandler : IRequestHandler<DeleteTransactionCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteTransactionCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task Handle(DeleteTransactionCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        var tx = await _db.Transactions
            .Include(t => t.Account)
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.UserId == userId, cancellationToken)
            ?? throw new Common.Exceptions.NotFoundException("Transaction not found.");

        tx.Account.Balance -= tx.Amount;
        _db.Transactions.Remove(tx);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
