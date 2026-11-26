using System.Globalization;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace Shaikh.Server.Controllers
{
    // Serves the last ~4 months of GitHub contributions for the homepage.
    // GitHub's public contributions page is read at most every 10 minutes and kept in memory,
    // so visitors never wait on GitHub. If GitHub can't be reached, the last good copy is used.
    [ApiController]
    [Route("api/github")]
    public class GitHubController : ControllerBase
    {
        private const string UserName = "MYShaikh";
        private const string FreshKey = "github-contributions";
        private const string LastGoodKey = "github-contributions-last-good";

        private static readonly Regex DayCell = new(
            "<td\\b[^>]*\\bdata-date=\"\\d{4}-\\d{2}-\\d{2}\"[^>]*>", RegexOptions.Compiled);
        private static readonly Regex Attr = new(
            "\\b(id|data-date|data-level)=\"([^\"]*)\"", RegexOptions.Compiled);
        private static readonly Regex Tooltip = new(
            "<tool-tip\\b[^>]*\\bfor=\"([^\"]+)\"[^>]*>([^<]*)</tool-tip>", RegexOptions.Compiled);
        private static readonly Regex LeadingNumber = new("^\\s*([\\d,]+)\\s+contribution", RegexOptions.Compiled);

        private readonly IHttpClientFactory _httpFactory;
        private readonly IMemoryCache _cache;
        private readonly ILogger<GitHubController> _log;

        public GitHubController(IHttpClientFactory httpFactory, IMemoryCache cache, ILogger<GitHubController> log)
        {
            _httpFactory = httpFactory;
            _cache = cache;
            _log = log;
        }

        public record ContributionDay(string Date, int Level, int Count);

        public record ContributionsResponse(
            string Profile, int Total, string From, string To, List<List<ContributionDay>> Weeks);

        [HttpGet("contributions")]
        public async Task<IActionResult> GetContributions()
        {
            if (_cache.TryGetValue(FreshKey, out ContributionsResponse? fresh) && fresh != null)
            {
                return Ok(fresh);
            }

            try
            {
                var client = _httpFactory.CreateClient();
                client.Timeout = TimeSpan.FromSeconds(10);
                client.DefaultRequestHeaders.UserAgent.ParseAdd("portfolio-site/1.0");

                string html = await client.GetStringAsync($"https://github.com/users/{UserName}/contributions");
                var result = Build(html);

                _cache.Set(FreshKey, result, TimeSpan.FromMinutes(10));
                _cache.Set(LastGoodKey, result);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _log.LogWarning(ex, "Could not load GitHub contributions");

                if (_cache.TryGetValue(LastGoodKey, out ContributionsResponse? lastGood) && lastGood != null)
                {
                    return Ok(lastGood);
                }

                return StatusCode(503);
            }
        }

        private static ContributionsResponse Build(string html)
        {
            // Contribution counts are in <tool-tip for="cell-id">3 contributions on ...</tool-tip>
            var counts = new Dictionary<string, int>();
            foreach (Match t in Tooltip.Matches(html))
            {
                var n = LeadingNumber.Match(t.Groups[2].Value);
                counts[t.Groups[1].Value] = n.Success
                    ? int.Parse(n.Groups[1].Value.Replace(",", ""), CultureInfo.InvariantCulture)
                    : 0;
            }

            // Each day is a <td data-date="yyyy-MM-dd" data-level="0-4" id="...">
            var days = new Dictionary<DateOnly, ContributionDay>();
            foreach (Match cell in DayCell.Matches(html))
            {
                string? id = null, date = null, level = null;
                foreach (Match a in Attr.Matches(cell.Value))
                {
                    switch (a.Groups[1].Value)
                    {
                        case "id": id = a.Groups[2].Value; break;
                        case "data-date": date = a.Groups[2].Value; break;
                        case "data-level": level = a.Groups[2].Value; break;
                    }
                }

                if (date == null || !DateOnly.TryParseExact(date, "yyyy-MM-dd", out var d)) { continue; }

                int lvl = int.TryParse(level, out var l) ? Math.Clamp(l, 0, 4) : 0;
                int count = id != null && counts.TryGetValue(id, out var c) ? c : 0;
                days[d] = new ContributionDay(date, lvl, count);
            }

            if (days.Count == 0)
            {
                throw new InvalidOperationException("No contribution days found on the GitHub page.");
            }

            // Last 4 months, in whole weeks that start on Sunday (like GitHub's own graph).
            DateOnly end = days.Keys.Max();
            DateOnly start = end.AddMonths(-4);
            start = start.AddDays(-(int)start.DayOfWeek);

            var weeks = new List<List<ContributionDay>>();
            int total = 0;
            for (var weekStart = start; weekStart <= end; weekStart = weekStart.AddDays(7))
            {
                var week = new List<ContributionDay>();
                for (int i = 0; i < 7; i++)
                {
                    var d = weekStart.AddDays(i);
                    if (d > end) { break; }

                    var day = days.TryGetValue(d, out var found)
                        ? found
                        : new ContributionDay(d.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture), 0, 0);
                    total += day.Count;
                    week.Add(day);
                }
                weeks.Add(week);
            }

            return new ContributionsResponse(
                $"https://github.com/{UserName}",
                total,
                start.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                end.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                weeks);
        }
    }
}
