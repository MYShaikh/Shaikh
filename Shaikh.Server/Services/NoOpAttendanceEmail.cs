namespace Shaikh.Server.Services
{
    // Used when no email connection string is configured: nothing is sent.
    public class NoOpAttendanceEmail : IAttendanceEmail
    {
        public Task AlertMeAsync(int attendance) => Task.CompletedTask;

        public Task<bool> NotifyContactAsync(string name, string email, string subject, string body) => Task.FromResult(false);
    }
}
