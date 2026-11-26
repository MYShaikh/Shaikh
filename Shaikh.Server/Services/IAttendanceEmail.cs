namespace Shaikh.Server.Services
{
    public interface IAttendanceEmail
    {
        /// <summary>Emails me when the visitor count reaches a milestone (every 10th visitor).</summary>
        public Task AlertMeAsync(int attendance);

        /// <summary>Emails me a copy of a contact-form message. Returns true if it was handed to Azure.</summary>
        public Task<bool> NotifyContactAsync(string name, string email, string subject, string body);
    }
}
