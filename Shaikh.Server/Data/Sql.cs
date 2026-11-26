using Microsoft.Data.SqlClient;

namespace Shaikh.Server.Data
{
    // Opens database connections that retry while the free serverless database wakes up.
    // After an hour without use the database pauses; the first connections then fail with
    // "database not currently available" (40613) or a timeout until it has resumed (~1 minute).
    public static class Sql
    {
        private static readonly SqlRetryLogicBaseProvider Retry =
            SqlConfigurableRetryFactory.CreateExponentialRetryProvider(new SqlRetryLogicOption
            {
                NumberOfTries = 6,                          // first try + 5 retries
                DeltaTime = TimeSpan.FromSeconds(5),        // 5 s, 10 s, 20 s, 20 s, 20 s ...
                MaxTimeInterval = TimeSpan.FromSeconds(20),
                // default list of transient errors already includes 40613, 4060, 40197, 40501, -2 (timeout)
            });

        public static SqlConnection Connect(string connectionString) =>
            new SqlConnection(connectionString) { RetryLogicProvider = Retry };
    }
}
