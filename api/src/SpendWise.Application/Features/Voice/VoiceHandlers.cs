using System.Text.RegularExpressions;
using MediatR;

namespace SpendWise.Application.Features.Voice;

public record ParseVoiceCommand(string Transcript) : IRequest<ParseVoiceResult>;

public record ParseVoiceResult(decimal? Amount, string? CategorySlug, string? Note);

public class ParseVoiceCommandHandler : IRequestHandler<ParseVoiceCommand, ParseVoiceResult>
{
    // Maps keyword fragments (lower-case) to category slugs matching the seeded categories.
    private static readonly (string[] Keywords, string Slug)[] CategoryRules =
    [
        (["lunch", "dinner", "breakfast", "restaurant", "takeaway", "takeout", "meal", "pizza", "burger", "sushi", "eat", "food", "snack", "groceries", "supermarket", "walmart", "lidl", "aldi", "tesco", "sainsbury", "grocery"], "food"),
        (["coffee", "latte", "cappuccino", "espresso", "cafe", "starbucks", "costa", "macchiato"], "coffee"),
        (["uber", "lyft", "taxi", "cab", "bus", "train", "subway", "metro", "tube", "petrol", "gas", "fuel", "parking", "toll", "transport", "commute", "tram", "ferry"], "transport"),
        (["amazon", "ebay", "shopping", "clothes", "shirt", "shoes", "jacket", "dress", "trousers", "jeans", "bag", "handbag", "fashion", "store", "shop", "purchase", "bought", "zara", "h&m", "primark"], "shopping"),
        (["rent", "mortgage", "home", "ikea", "furniture", "sofa", "bed", "household", "cleaning", "repair", "maintenance"], "home"),
        (["electric", "electricity", "water", "gas bill", "internet", "broadband", "phone bill", "utility", "utilities", "council", "heating", "wifi"], "utilities"),
        (["doctor", "dentist", "hospital", "pharmacy", "medicine", "prescription", "gym", "fitness", "health", "medical", "therapy", "clinic"], "health"),
        (["flight", "hotel", "airbnb", "hostel", "travel", "holiday", "vacation", "trip", "booking", "visa", "passport", "luggage"], "travel"),
        (["cinema", "movie", "theatre", "theater", "concert", "game", "gaming", "spotify", "netflix", "disney", "fun", "entertainment", "tickets"], "fun"),
        (["school", "university", "college", "course", "book", "textbook", "tuition", "education", "training", "class", "lesson"], "education"),
        (["netflix", "spotify", "apple", "google", "subscription", "membership", "prime", "bill", "bills", "insurance", "broadband", "tv license", "council tax"], "bills"),
    ];

    // Matches amounts like: $45, 45, 45.50, £45, €45, 45 dollars, 45 pounds
    private static readonly Regex AmountRegex = new(
        @"(?:[$£€])\s*(\d{1,6}(?:[.,]\d{1,2})?)|(\d{1,6}(?:[.,]\d{1,2})?)\s*(?:dollars?|pounds?|euros?|bucks?|quid|usd|gbp|eur)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    // Fallback: bare number in the transcript
    private static readonly Regex BareNumberRegex = new(
        @"\b(\d{1,6}(?:[.,]\d{1,2})?)\b",
        RegexOptions.Compiled);

    public Task<ParseVoiceResult> Handle(ParseVoiceCommand request, CancellationToken cancellationToken)
    {
        var text = request.Transcript?.Trim() ?? string.Empty;
        var lower = text.ToLowerInvariant();

        var amount = ExtractAmount(lower);
        var categorySlug = ExtractCategory(lower);
        var note = BuildNote(text, amount, categorySlug);

        return Task.FromResult(new ParseVoiceResult(amount, categorySlug, note));
    }

    private static decimal? ExtractAmount(string lower)
    {
        var match = AmountRegex.Match(lower);
        if (match.Success)
        {
            var raw = (match.Groups[1].Success ? match.Groups[1].Value : match.Groups[2].Value)
                .Replace(",", ".");
            if (decimal.TryParse(raw, System.Globalization.NumberStyles.Any,
                    System.Globalization.CultureInfo.InvariantCulture, out var val))
                return val;
        }

        // Bare number fallback — take the first number found
        var bare = BareNumberRegex.Match(lower);
        if (bare.Success)
        {
            var raw = bare.Groups[1].Value.Replace(",", ".");
            if (decimal.TryParse(raw, System.Globalization.NumberStyles.Any,
                    System.Globalization.CultureInfo.InvariantCulture, out var val))
                return val;
        }

        return null;
    }

    private static string? ExtractCategory(string lower)
    {
        foreach (var (keywords, slug) in CategoryRules)
        {
            foreach (var kw in keywords)
            {
                if (lower.Contains(kw, StringComparison.OrdinalIgnoreCase))
                    return slug;
            }
        }

        return null;
    }

    private static string? BuildNote(string original, decimal? amount, string? categorySlug)
    {
        // Remove currency symbols and amount tokens from the note
        var note = Regex.Replace(original, @"[$£€]?\s*\d+(?:[.,]\d{1,2})?\s*(?:dollars?|pounds?|euros?|bucks?|quid|usd|gbp|eur)?", "", RegexOptions.IgnoreCase);

        // Remove common filler phrases
        note = Regex.Replace(note, @"\b(i\s+(?:spent|paid|bought|got|had)|spent\s+on|paid\s+for|bought|expense\s+(?:for|on)|add\s+an?\s+expense)\b", "", RegexOptions.IgnoreCase);

        // Remove category keywords that are already captured
        if (categorySlug != null)
        {
            var rule = Array.Find(CategoryRules, r => r.Slug == categorySlug);
            foreach (var kw in rule.Keywords)
            {
                note = Regex.Replace(note, $@"\b{Regex.Escape(kw)}\b", "", RegexOptions.IgnoreCase);
            }
        }

        // Clean up extra whitespace and punctuation
        note = Regex.Replace(note, @"[\s,;.!?]+", " ").Trim();
        note = note.Trim(' ', ',', '.', '!', '?', '-', '—');

        return string.IsNullOrWhiteSpace(note) ? null : TitleCase(note);
    }

    private static string TitleCase(string s)
    {
        if (string.IsNullOrEmpty(s)) return s;
        return char.ToUpper(s[0]) + s[1..];
    }
}
