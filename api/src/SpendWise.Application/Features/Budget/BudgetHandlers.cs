using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SpendWise.Application.Common;
using SpendWise.Application.Common.Interfaces;
using SpendWise.Application.Common.Models;

namespace SpendWise.Application.Features.Budget;

public record GetCurrentBudgetQuery : IRequest<BudgetSummaryDto>;

public class GetCurrentBudgetQueryHandler : IRequestHandler<GetCurrentBudgetQuery, BudgetSummaryDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetCurrentBudgetQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<BudgetSummaryDto> Handle(GetCurrentBudgetQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        var period = await BudgetHelper.GetOrCreateCurrentPeriodAsync(userId, _db, cancellationToken)
            ?? throw new Common.Exceptions.NotFoundException("Budget period not found.");

        var spent = await BudgetHelper.GetSpentByCategoryAsync(
            userId, period.Year, period.Month, _db, cancellationToken);

        return BudgetHelper.ToSummaryDto(period, spent);
    }
}

public record UpdateBudgetLinesCommand(IReadOnlyList<BudgetLineUpdate> Lines) : IRequest<BudgetSummaryDto>;

public record BudgetLineUpdate(Guid CategoryId, decimal LimitAmount);

public class UpdateBudgetLinesCommandValidator : AbstractValidator<UpdateBudgetLinesCommand>
{
    public UpdateBudgetLinesCommandValidator()
    {
        RuleFor(x => x.Lines).NotEmpty();
        RuleForEach(x => x.Lines).ChildRules(line =>
        {
            line.RuleFor(l => l.LimitAmount).GreaterThanOrEqualTo(0);
        });
    }
}

public class UpdateBudgetLinesCommandHandler : IRequestHandler<UpdateBudgetLinesCommand, BudgetSummaryDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notifications;

    public UpdateBudgetLinesCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser,
        INotificationService notifications)
    {
        _db = db;
        _currentUser = currentUser;
        _notifications = notifications;
    }

    public async Task<BudgetSummaryDto> Handle(UpdateBudgetLinesCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        var period = await BudgetHelper.GetOrCreateCurrentPeriodAsync(userId, _db, cancellationToken)!;

        foreach (var update in request.Lines)
        {
            var line = period!.Lines.FirstOrDefault(l => l.CategoryId == update.CategoryId);
            if (line != null)
            {
                line.LimitAmount = update.LimitAmount;
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
        await _notifications.CheckBudgetThresholdsAsync(userId, period!.Id, cancellationToken);

        var spent = await BudgetHelper.GetSpentByCategoryAsync(
            userId, period.Year, period.Month, _db, cancellationToken);

        return BudgetHelper.ToSummaryDto(period, spent);
    }
}

public record UpdateBudgetTotalCommand(decimal TotalLimit) : IRequest<BudgetSummaryDto>;

public class UpdateBudgetTotalCommandValidator : AbstractValidator<UpdateBudgetTotalCommand>
{
    public UpdateBudgetTotalCommandValidator()
    {
        RuleFor(x => x.TotalLimit).GreaterThanOrEqualTo(0);
    }
}

public class UpdateBudgetTotalCommandHandler : IRequestHandler<UpdateBudgetTotalCommand, BudgetSummaryDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateBudgetTotalCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<BudgetSummaryDto> Handle(UpdateBudgetTotalCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.UnauthorizedException("Not authenticated.");

        var period = await BudgetHelper.GetOrCreateCurrentPeriodAsync(userId, _db, cancellationToken)!;
        period!.TotalLimit = request.TotalLimit;
        await _db.SaveChangesAsync(cancellationToken);

        var spent = await BudgetHelper.GetSpentByCategoryAsync(
            userId, period.Year, period.Month, _db, cancellationToken);

        return BudgetHelper.ToSummaryDto(period, spent);
    }
}
