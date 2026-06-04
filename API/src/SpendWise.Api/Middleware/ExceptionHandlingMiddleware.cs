using Microsoft.AspNetCore.Mvc;
using SpendWise.Application.Common.Exceptions;

namespace SpendWise.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await WriteProblem(context, "Validation failed", ex.Message, ex.Errors);
        }
        catch (NotFoundException ex)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await WriteProblem(context, "Not found", ex.Message);
        }
        catch (UnauthorizedException ex)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await WriteProblem(context, "Unauthorized", ex.Message);
        }
        catch (ForbiddenException ex)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await WriteProblem(context, "Forbidden", ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await WriteProblem(context, "Internal server error", "An unexpected error occurred.");
        }
    }

    private static async Task WriteProblem(
        HttpContext context,
        string title,
        string detail,
        IDictionary<string, string[]>? errors = null)
    {
        context.Response.ContentType = "application/problem+json";
        var problem = new ProblemDetails
        {
            Title = title,
            Detail = detail,
            Status = context.Response.StatusCode,
            Instance = context.Request.Path,
        };

        if (errors != null)
        {
            problem.Extensions["errors"] = errors;
        }

        await context.Response.WriteAsJsonAsync(problem);
    }
}
