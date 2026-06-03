using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendWise.Application.Features.Voice;

namespace SpendWise.Api.Controllers;

[ApiController]
[Route("api/voice")]
[Authorize]
public class VoiceController : ControllerBase
{
    private readonly IMediator _mediator;

    public VoiceController(IMediator mediator) => _mediator = mediator;

    /// <summary>
    /// Parses a natural-language voice transcript and extracts expense details
    /// (amount, category slug, and a cleaned note).
    /// </summary>
    [HttpPost("parse")]
    public async Task<ParseVoiceResponse> Parse([FromBody] ParseVoiceRequest request)
    {
        var result = await _mediator.Send(new ParseVoiceCommand(request.Transcript));
        return new ParseVoiceResponse(result.Amount, result.CategorySlug, result.Note);
    }
}

public record ParseVoiceRequest(string Transcript);

public record ParseVoiceResponse(decimal? Amount, string? CategorySlug, string? Note);
