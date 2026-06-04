using MediatR;
using Microsoft.Extensions.DependencyInjection;
using SpendWise.Application;
using SpendWise.Application.Common.Interfaces;
using SpendWise.Application.Features.Auth;
using SpendWise.Application.Features.Dashboard;
using SpendWise.Application.Features.Transactions;
using SpendWise.Domain.Entities;
using SpendWise.Domain.Enums;

namespace SpendWise.Application.Tests;

public class HandlerTests
{
    [Fact]
    public async Task GoogleLoginCommand_CreatesUser_OnFirstLogin()
    {
        await using var provider = CreateProvider(services =>
        {
            services.AddScoped<IGoogleTokenValidator>(_ => new StubGoogleValidator());
        });

        var mediator = provider.GetRequiredService<IMediator>();
        var result = await mediator.Send(new GoogleLoginCommand("dev-google:newuser:test@gmail.com"));

        Assert.NotEmpty(result.AccessToken);
        Assert.Equal("test@gmail.com", result.User.Email);

        var db = provider.GetRequiredService<IApplicationDbContext>();
        Assert.Equal(1, db.Users.Count());
    }

    [Fact]
    public async Task CreateTransaction_UpdatesAccountBalance()
    {
        var userId = Guid.NewGuid();
        await using var provider = CreateProvider(services =>
        {
            services.AddSingleton<ICurrentUserService>(new StubCurrentUserService(userId));
            services.AddScoped<INotificationService, NoOpNotificationService>();
        });

        var db = provider.GetRequiredService<IApplicationDbContext>();
        await SeedUserWithAccountAsync(db, userId);

        var account = db.Accounts.First();
        var mediator = provider.GetRequiredService<IMediator>();

        await mediator.Send(new CreateTransactionCommand(
            account.Id, "food", "Lunch", 25m, null, null, DateTime.UtcNow));

        var updatedAccount = db.Accounts.First(a => a.Id == account.Id);
        Assert.Equal(975m, updatedAccount.Balance);
        Assert.Single(db.Transactions);
    }

    [Fact]
    public async Task GetDashboard_ReturnsAggregates()
    {
        var userId = Guid.NewGuid();
        await using var provider = CreateProvider(services =>
        {
            services.AddSingleton<ICurrentUserService>(new StubCurrentUserService(userId));
        });

        var db = provider.GetRequiredService<IApplicationDbContext>();
        await SeedUserWithAccountAsync(db, userId);

        var account = db.Accounts.First();
        var foodId = db.Categories.First(c => c.Slug == "food").Id;
        var incomeId = db.Categories.First(c => c.Slug == "income").Id;

        db.Transactions.Add(new MoneyTransaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AccountId = account.Id,
            CategoryId = incomeId,
            Name = "Salary",
            Amount = 1000m,
            OccurredAt = DateTime.UtcNow,
        });
        db.Transactions.Add(new MoneyTransaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AccountId = account.Id,
            CategoryId = foodId,
            Name = "Lunch",
            Amount = -50m,
            OccurredAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();

        var mediator = provider.GetRequiredService<IMediator>();
        var dashboard = await mediator.Send(new GetDashboardQuery());

        Assert.Equal(1000m, dashboard.Balance);
        Assert.Equal(1000m, dashboard.MonthlyIncome);
        Assert.Equal(50m, dashboard.MonthlyExpenses);
        Assert.Single(dashboard.SpendingByCategory);
    }

    private static ServiceProvider CreateProvider(Action<IServiceCollection>? configure = null)
    {
        var services = new ServiceCollection();
        TestServiceProvider.Configure(services);
        services.AddApplication();
        configure?.Invoke(services);
        return services.BuildServiceProvider();
    }

    private static async Task SeedUserWithAccountAsync(IApplicationDbContext db, Guid userId)
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
        });
        await db.SaveChangesAsync();
    }

    private sealed class StubGoogleValidator : IGoogleTokenValidator
    {
        public Task<ExternalLoginPayload?> ValidateAsync(string idToken, CancellationToken cancellationToken = default) =>
            Task.FromResult<ExternalLoginPayload?>(new ExternalLoginPayload(
                "Google", "stub-subject", "test@gmail.com", "Test User"));
    }

    private sealed class StubCurrentUserService(Guid userId) : ICurrentUserService
    {
        public Guid? UserId => userId;
        public bool IsAuthenticated => true;
    }

    private sealed class NoOpNotificationService : INotificationService
    {
        public Task PublishAsync(Guid userId, string title, string body, string iconKey, string iconColor, string iconBg, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;

        public Task CheckBudgetThresholdsAsync(Guid userId, Guid budgetPeriodId, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;
    }
}
