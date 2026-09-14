namespace Shaikh.Server.Services
{
    public class NoOpAttendanceEmail : IAttendanceEmail
    {
        public Task AlertMeAsync(int attendance) => Task.CompletedTask;
    }
}
