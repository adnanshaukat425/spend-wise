using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpendWise.Infrastructure.Persistence;

namespace SpendWise.Api.Controllers;

[ApiController]
[Route("api")]
public class HealthController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public HealthController(ApplicationDbContext db) => _db = db;

    [HttpGet("healthz")]
    [AllowAnonymous]
    public IActionResult Healthz() => Ok(new { status = "ok" });

    [HttpGet("readyz")]
    [AllowAnonymous]
    public async Task<IActionResult> Readyz(CancellationToken cancellationToken)
    {
        var canConnect = await _db.Database.CanConnectAsync(cancellationToken);
        if (!canConnect)
        {
            return StatusCode(503, new { status = "unavailable" });
        }

        return Ok(new { status = "ready" });
    }
}
