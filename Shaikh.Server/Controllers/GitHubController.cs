using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Shaikh.Server.Data;

namespace Shaikh.Server.Controllers
{
    // Serves the last ~4 months of my GitHub contributions for the homepage, matching what
    // I see on GitHub when logged in:
    //  - Days before GitHubSnapshot.LiveFrom come from a saved copy of my logged-in calendar
    //    (it includes private Vensure work that GitHub never shows publicly).
    //  - Newer days come live from GitHub's public calendar, which counts days in UTC.
    //    GitHub's public activity times are used to move late-evening work back onto the
    //    right Eastern-time day, like my own GitHub view.
    //  - Shades use GitHub's rule: 4 bands relative to the busiest day of the last year.
    // GitHub is read at most every 10 minutes and kept in memory, so visitors never wait on it.
    [ApiController]
    [Route("api/github")]
    public class GitHubController : ControllerBase
    {
        private const string UserName = "MYShaikh";
        private const string FreshKey = "github-contributions";
        private const string LastGoodKey = "github-contributions-last-good";

        private static readonly TimeZoneInfo Eastern = TimeZoneInfo.FindSystemTimeZoneById("America/New_York");

        private static readonly Regex DayCell = new(
            "<td\\b[^>]*\\bdata-date=\"\\d{4}-\\d{2}-\\d{2}\"[^>]*>", RegexOptions.Compiled);
        private static readonly Regex Attr = new(
            "\\b(id|data-date)=\"([^\"]*)\"", RegexOptions.Compiled);
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
                var publicUtc = ParseCalendar(html);
                var activityTimes = await GetActivityTimesAsync(client);

                var result = Build(publicUtc, activityTimes);

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

        /// <summary>Day → count from GitHub's public calendar (days are in UTC).</summary>
        private static Dictionary<DateOnly, int> ParseCalendar(string html)
        {
            var counts = new Dictionary<string, int>();
            foreach (Match t in Tooltip.Matches(html))
            {
                var n = LeadingNumber.Match(t.Groups[2].Value);
                counts[t.Groups[1].Value] = n.Success
                    ? int.Parse(n.Groups[1].Value.Replace(",", ""), CultureInfo.InvariantCulture)
                    : 0;
            }

            var days = new Dictionary<DateOnly, int>();
            foreach (Match cell in DayCell.Matches(html))
            {
                string? id = null, date = null;
                foreach (Match a in Attr.Matches(cell.Value))
                {
                    if (a.Groups[1].Value == "id") { id = a.Groups[2].Value; }
                    else { date = a.Groups[2].Value; }
                }

                if (date == null || !DateOnly.TryParseExact(date, "yyyy-MM-dd", out var d)) { continue; }
                days[d] = id != null && counts.TryGetValue(id, out var c) ? c : 0;
            }

            if (days.Count == 0)
            {
                throw new InvalidOperationException("No contribution days found on the GitHub page.");
            }
            return days;
        }

        /// <summary>
        /// Times of my recent public GitHub activity (pushes, pull requests, ...), used to tell
        /// which Eastern-time day a UTC calendar day's work belongs to. Empty if unavailable.
        /// </summary>
        private async Task<List<DateTime>> GetActivityTimesAsync(HttpClient client)
        {
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Get,
                    $"https://api.github.com/users/{UserName}/events/public?per_page=100");
                request.Headers.Accept.ParseAdd("application/vnd.github+json");

                using var response = await client.SendAsync(request);
                if (!response.IsSuccessStatusCode) { return new(); }

                using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
                var times = new List<DateTime>();
                foreach (var e in doc.RootElement.EnumerateArray())
                {
                    if (e.TryGetProperty("created_at", out var t) && t.TryGetDateTime(out var when))
                    {
                        times.Add(when.ToUniversalTime());
                    }
                }
                return times;
            }
            catch (Exception ex)
            {
                _log.LogInformation(ex, "GitHub activity times unavailable; using UTC days");
                return new();
            }
        }

        private static ContributionsResponse Build(Dictionary<DateOnly, int> publicUtc, List<DateTime> activityTimes)
        {
            DateOnly today = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Eastern));

            // ---- Live part: move each UTC day's count onto Eastern days ----
            var liveEastern = new Dictionary<DateOnly, int>();
            foreach (var (utcDay, count) in publicUtc)
            {
                if (count == 0 || utcDay < GitHubSnapshot.LiveFrom) { continue; }

                // Activity on this UTC day: how much of it was still "yesterday" in Eastern time?
                var onDay = activityTimes.Where(t => DateOnly.FromDateTime(t) == utcDay).ToList();
                int movedBack = 0;
                if (onDay.Count > 0)
                {
                    int previousDay = onDay.Count(t => DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(t, Eastern)) < utcDay);
                    movedBack = (int)Math.Round(count * (double)previousDay / onDay.Count);
                }

                Add(liveEastern, utcDay.AddDays(-1), movedBack);
                Add(liveEastern, utcDay, count - movedBack);
            }

            // ---- Combine: snapshot before LiveFrom, live from then on ----
            int CountFor(DateOnly d)
            {
                if (d < GitHubSnapshot.LiveFrom)
                {
                    if (d >= GitHubSnapshot.CoveredFrom)
                    {
                        return GitHubSnapshot.Days.TryGetValue(d.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture), out var s) ? s : 0;
                    }
                    return publicUtc.TryGetValue(d, out var p) ? p : 0;
                }

                // Anything GitHub already dates after today (UTC is ahead of Eastern) belongs to today
                if (d == today)
                {
                    return liveEastern.Where(kv => kv.Key >= today).Sum(kv => kv.Value);
                }
                return liveEastern.TryGetValue(d, out var l) ? l : 0;
            }

            // ---- GitHub's shading: 4 equal bands up to the busiest day of the last year ----
            int busiest = 0;
            for (var d = today.AddDays(-364); d <= today; d = d.AddDays(1))
            {
                busiest = Math.Max(busiest, CountFor(d));
            }

            int LevelFor(int count) => count <= 0 || busiest == 0
                ? 0
                : Math.Clamp((int)Math.Ceiling(count * 4.0 / busiest), 1, 4);

            // ---- Last 4 months, in whole weeks that start on Sunday (like GitHub's graph) ----
            DateOnly start = today.AddMonths(-4);
            start = start.AddDays(-(int)start.DayOfWeek);

            var weeks = new List<List<ContributionDay>>();
            int total = 0;
            for (var weekStart = start; weekStart <= today; weekStart = weekStart.AddDays(7))
            {
                var week = new List<ContributionDay>();
                for (int i = 0; i < 7; i++)
                {
                    var d = weekStart.AddDays(i);
                    if (d > today) { break; }

                    int count = CountFor(d);
                    total += count;
                    week.Add(new ContributionDay(d.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture), LevelFor(count), count));
                }
                weeks.Add(week);
            }

            return new ContributionsResponse(
                $"https://github.com/{UserName}",
                total,
                start.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                today.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                weeks);
        }

        private static void Add(Dictionary<DateOnly, int> map, DateOnly day, int value)
        {
            if (value == 0) { return; }
            map[day] = map.TryGetValue(day, out var v) ? v + value : value;
        }
    }
}
