namespace Shaikh.Server.Data
{
    // Snapshot of my GitHub contribution calendar as I see it when logged in, saved on 2026-11-26.
    // It includes private work at Vensure (Jul-Oct 2026), which GitHub never shows publicly,
    // and its days are in Eastern time like my own GitHub view.
    // Days before 2026-11-26 come from here; days from 2026-11-26 on come from GitHub live.
    // Only days with contributions are listed. Range covered: 2025-11-23 to 2026-11-26 (exclusive).
    public static class GitHubSnapshot
    {
        public static readonly DateOnly CoveredFrom = new(2025, 11, 23);
        public static readonly DateOnly LiveFrom = new(2026, 11, 26);

        public static readonly IReadOnlyDictionary<string, int> Days = new Dictionary<string, int>
        {
            ["2026-02-22"] = 1,
            ["2026-03-28"] = 4,
            ["2026-07-24"] = 4,
            ["2026-07-25"] = 2,
            ["2026-07-26"] = 7,
            ["2026-07-27"] = 1,
            ["2026-08-02"] = 1,
            ["2026-08-04"] = 1,
            ["2026-09-01"] = 1,
            ["2026-09-10"] = 2,
            ["2026-09-11"] = 13,
            ["2026-09-13"] = 2,
            ["2026-09-27"] = 3,
            ["2026-10-01"] = 7,
            ["2026-10-03"] = 24,
            ["2026-10-04"] = 3,
            ["2026-10-07"] = 15,
            ["2026-10-08"] = 26,
            ["2026-10-09"] = 19,
            ["2026-10-10"] = 1,
            ["2026-10-11"] = 1,
            ["2026-10-12"] = 16,
            ["2026-10-13"] = 23,
            ["2026-10-14"] = 44,
            ["2026-10-15"] = 6,
            ["2026-10-16"] = 9,
            ["2026-10-20"] = 2,
            ["2026-10-21"] = 2,
            ["2026-10-22"] = 2,
            ["2026-10-28"] = 2,
            ["2026-11-01"] = 2,
            ["2026-11-13"] = 10,
            ["2026-11-14"] = 2,
            ["2026-11-15"] = 14,
            ["2026-11-25"] = 12
        };
    }
}
