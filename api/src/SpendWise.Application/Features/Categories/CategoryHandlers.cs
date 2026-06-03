using MediatR;
using Microsoft.EntityFrameworkCore;
using SpendWise.Application.Common.Interfaces;
using SpendWise.Application.Common.Models;
using SpendWise.Domain.Enums;

namespace SpendWise.Application.Features.Categories;

public record GetCategoriesQuery(string? Type) : IRequest<IReadOnlyList<CategoryDto>>;

public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, IReadOnlyList<CategoryDto>>
{
    private readonly IApplicationDbContext _db;

    public GetCategoriesQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Categories.AsQueryable();
        if (!string.IsNullOrWhiteSpace(request.Type)
            && Enum.TryParse<CategoryType>(request.Type, true, out var type))
        {
            query = query.Where(c => c.Type == type);
        }

        return await query
            .OrderBy(c => c.SortOrder)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Slug = c.Slug,
                Name = c.Name,
                Type = c.Type.ToString(),
                IconKey = c.IconKey,
                IconBg = c.IconBg,
                IconColor = c.IconColor,
            })
            .ToListAsync(cancellationToken);
    }
}
