namespace Shaikh.Server.Services
{
    public interface IAttendanceEmail
    {
        public Task AlertMeAsync(int attendance);
    }
}