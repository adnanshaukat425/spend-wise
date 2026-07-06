using MediatR;
using Microsoft.Extensions.DependencyInjection;
using SpendWise.Application;
using SpendWise.Application.Common.Interfaces;
using SpendWise.Application.Features.Accounts;
using SpendWise.Domain.Entities;
using SpendWise.Domain.Enums;

namespace SpendWise.Application.Tests;

public class AccountHandlerTests
{
    [Fact]
    public async Task CreateAccount_FirstAccountBecomesDefault()
    {
        var userId = Guid.NewGuid();
        await using var provider = CreateProvider(userId);
        var mediator = provider.GetRequiredService<IMediator>();

        var created = await mediator.Send(new CreateAccountCommand(
            "Primary", "Checking", 100m, "1234", "wallet", "#3B82F6"));

        Assert.True(created.IsDefault);
    }

    [Fact]
    public async Task CreateAccount_SecondAccountIsNotDefault()
    {
        var userId = Guid.NewGuid();
        await using var provider = CreateProvider(userId);
        var db = provider.GetRequiredService<IApplicationDbContext>();
        await SeedUserWithAccountAsync(db, userId, isDefault: true);

        var mediator = provider.GetRequiredService<IMediator>();
        var created = await mediator.Send(new CreateAccountCommand(
            "Secondary", "Savings", 50m, "5678", "save", "#10B981"));

        Assert.False(created.IsDefault);
    }

    [Fact]
    public async Task SetDefaultAccount_ClearsPreviousDefault()
    {
        var userId = Guid.NewGuid();
        await using var provider = CreateProvider(userId);
        var db = provider.GetRequiredService<IApplicationDbContext>();
        await SeedUserWithAccountAsync(db, userId, isDefault: true);

        var second = db.Accounts.First();
        var mediator = provider.GetRequiredService<IMediator>();
        var created = await mediator.Send(new CreateAccountCommand(
            "Secondary", "Savings", 50m, "5678", "save", "#10B981"));

        await mediator.Send(new SetDefaultAccountCommand(created.Id));

        var accounts = db.Accounts.Where(a => a.UserId == userId && a.IsActive).ToList();
        Assert.Single(accounts, a => a.IsDefault);
        Assert.Equal(created.Id, accounts.Single(a => a.IsDefault).Id);
        Assert.NotEqual(second.Id, created.Id);
    }

    [Fact]
    public async Task DeleteDefaultAccount_ThrowsValidationError()
    {
        var userId = Guid.NewGuid();
        await using var provider = CreateProvider(userId);
        var db = provider.GetRequiredService<IApplicationDbContext>();
        await SeedUserWithAccountAsync(db, userId, isDefault: true);

        var account = db.Accounts.First();
        var mediator = provider.GetRequiredService<IMediator>();

        await Assert.ThrowsAsync<SpendWise.Application.Common.Exceptions.ValidationException>(
            () => mediator.Send(new DeleteAccountCommand(account.Id, false)));
    }

    [Fact]
    public async Task DeleteNonDefaultAccount_MovesExpensesOnlyByDefault()
    {
        var userId = Guid.NewGuid();
        await using var provider = CreateProvider(userId);
        var db = provider.GetRequiredService<IApplicationDbContext>();
        await SeedUserWithAccountsWithTransactionsAsync(db, userId);

        var defaultAccount = db.Accounts.Single(a => a.IsDefault);
        var secondaryAccount = db.Accounts.Single(a => !a.IsDefault);
        var defaultBalanceBefore = defaultAccount.Balance;
        var expense = db.Transactions.Single(t => t.AccountId == secondaryAccount.Id && t.Amount < 0);
        var income = db.Transactions.Single(t => t.AccountId == secondaryAccount.Id && t.Amount > 0);

        var mediator = provider.GetRequiredService<IMediator>();
        await mediator.Send(new DeleteAccountCommand(secondaryAccount.Id, false));

        Assert.False(db.Accounts.Single(a => a.Id == secondaryAccount.Id).IsActive);
        Assert.Equal(defaultAccount.Id, expense.AccountId);
        Assert.Equal(secondaryAccount.Id, income.AccountId);
        Assert.Equal(defaultBalanceBefore + expense.Amount, defaultAccount.Balance);
    }

    [Fact]
    public async Task DeleteNonDefaultAccount_MovesIncomeWhenRequested()
    {
        var userId = Guid.NewGuid();
        await using var provider = CreateProvider(userId);
        var db = provider.GetRequiredService<IApplicationDbContext>();
        await SeedUserWithAccountsWithTransactionsAsync(db, userId);

        var defaultAccount = db.Accounts.Single(a => a.IsDefault);
        var secondaryAccount = db.Accounts.Single(a => !a.IsDefault);
        var defaultBalanceBefore = defaultAccount.Balance;
        var expense = db.Transactions.Single(t => t.AccountId == secondaryAccount.Id && t.Amount < 0);
        var income = db.Transactions.Single(t => t.AccountId == secondaryAccount.Id && t.Amount > 0);

        var mediator = provider.GetRequiredService<IMediator>();
        await mediator.Send(new DeleteAccountCommand(secondaryAccount.Id, true));

        Assert.Equal(defaultAccount.Id, expense.AccountId);
        Assert.Equal(defaultAccount.Id, income.AccountId);
        Assert.Equal(defaultBalanceBefore + expense.Amount + income.Amount, defaultAccount.Balance);
    }

    private static ServiceProvider CreateProvider(Guid userId)
    {
        var services = new ServiceCollection();
        TestServiceProvider.Configure(services);
        services.AddApplication();
        services.AddSingleton<ICurrentUserService>(new StubCurrentUserService(userId));
        return services.BuildServiceProvider();
    }

    private static async Task SeedUserWithAccountAsync(
        IApplicationDbContext db,
        Guid userId,
        bool isDefault = true)
    {
        await TestServiceProvider.SeedCategoriesAsync(db);
        db.Users.Add(new ApplicationUser
        {
            Id = userId,
            UserName = "user@test.com",
            Email = "user@test.com",
            DisplayName = "Test User",
        });
        db.UserPreferences.Add(new UserPreference { UserId = userId });
        db.Accounts.Add(new Account
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = "Checking",
            AccountType = AccountType.Checking,
            Balance = 1000m,
            IsDefault = isDefault,
        });
        await db.SaveChangesAsync();
    }

    private static async Task SeedUserWithAccountsWithTransactionsAsync(
        IApplicationDbContext db,
        Guid userId)
    {
        await TestServiceProvider.SeedCategoriesAsync(db);
        db.Users.Add(new ApplicationUser
        {
            Id = userId,
            UserName = "user@test.com",
            Email = "user@test.com",
            DisplayName = "Test User",
        });
        db.UserPreferences.Add(new UserPreference { UserId = userId });

        var defaultAccount = new Account
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = "Default Checking",
            AccountType = AccountType.Checking,
            Balance = 1000m,
            IsDefault = true,
        };
        var secondaryAccount = new Account
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = "Secondary Savings",
            AccountType = AccountType.Savings,
            Balance = 300m,
            IsDefault = false,
        };

        db.Accounts.AddRange(defaultAccount, secondaryAccount);

        var foodId = db.Categories.First(c => c.Slug == "food").Id;
        var incomeId = db.Categories.First(c => c.Slug == "income").Id;

        db.Transactions.Add(new MoneyTransaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AccountId = secondaryAccount.Id,
            CategoryId = foodId,
            Name = "Coffee",
            Amount = -20m,
            OccurredAt = DateTime.UtcNow,
        });
        db.Transactions.Add(new MoneyTransaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AccountId = secondaryAccount.Id,
            CategoryId = incomeId,
            Name = "Refund",
            Amount = 50m,
            OccurredAt = DateTime.UtcNow,
        });

        await db.SaveChangesAsync();
    }

    private sealed class StubCurrentUserService(Guid userId) : ICurrentUserService
    {
        public Guid? UserId => userId;
        public bool IsAuthenticated => true;
    }
}
