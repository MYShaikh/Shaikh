using Azure;
using Azure.Communication.Email;
namespace Shaikh.Server.Services
{
    public class AttendanceEmailService: IAttendanceEmail
    {
        private readonly ILogger<AttendanceEmailService> _logger;
        private readonly EmailClient _emailClient;
        private readonly string _senderAddress;
        private readonly string _recipientAddress;

        public AttendanceEmailService(
            EmailClient emailClient,
            IConfiguration configuration,
            ILogger<AttendanceEmailService> logger)
        {
            _emailClient = emailClient;
            _logger = logger;
            _senderAddress = configuration["EmailSettings:SenderAddress"]
                             ?? "DoNotReply@myshaikh237.com";
            _recipientAddress = configuration["EmailSettings:RecipientAddress"]
                                ?? "myshaikh237@gmail.com";
        }

        public async Task AlertMeAsync(int viewerCount)
        {
            try
            {
                string subject = $"Milestone: {viewerCount} visitors!";
                string htmlContent = $"<p>Your site just reached its {viewerCount}th visitor.</p>";
                await _emailClient.SendAsync(WaitUntil.Started, _senderAddress, _recipientAddress, subject, htmlContent);
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
