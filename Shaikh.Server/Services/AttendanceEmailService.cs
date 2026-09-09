using Azure;
using Azure.Communication.Email;
namespace Shaikh.Server.Services
{
    public class AttendanceEmailService: IAttendanceEmail
    {
        private readonly ILogger<AttendanceEmailService> _logger;
        private readonly EmailClient _emailClient;

        public AttendanceEmailService(EmailClient emailClient, ILogger<AttendanceEmailService> logger)
        {
            _emailClient = emailClient;
            _logger = logger;
        }

        public async Task AlertMeAsync(int viewerCount)
        {
            try
            {
                string senderAddress = "DoNotReply@1556650d-4d3b-427c-8136-240139c43694.azurecomm.net";
                string recipientAddress = "myshaikh237@gmail.com";
                string subject = $"Milestone: {viewerCount} visitors!";
                string htmlContent = $"<p>Your site just reached its {viewerCount}th visitor.</p>";
                await _emailClient.SendAsync(WaitUntil.Completed, senderAddress, recipientAddress, subject, htmlContent);
                _logger.LogInformation("Milestone email sent for viewer count {ViewerCount}", viewerCount);
            }
            catch (RequestFailedException ex)
            {
                _logger.LogError(ex, "Azure email request failed for viewer count {ViewerCount}", viewerCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error sending milestone email for viewer count {ViewerCount}", viewerCount);
            }
        }
    }
}