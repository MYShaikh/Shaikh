using Azure;
using Azure.Communication.Email;
using System.Net;
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
                string htmlContent = $"<p>Your site just reached visitor number {viewerCount}.</p>";
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
    
        public async Task<bool> NotifyContactAsync(string name, string email, string subject, string body)
        {
            try
            {
                string Enc(string v) => WebUtility.HtmlEncode(v ?? string.Empty);

                string html =
                    "<h2>New message from your website</h2>" +
                    $"<p><b>Name:</b> {Enc(name)}<br><b>Email:</b> {Enc(email)}<br><b>Subject:</b> {Enc(subject)}</p>" +
                    $"<p style=\"white-space:pre-wrap\">{Enc(body)}</p>" +
                    "<p style=\"color:#888\">Reply to this email to answer them directly.</p>";

                var message = new EmailMessage(
                    _senderAddress,
                    _recipientAddress,
                    new EmailContent($"Website contact: {subject}") { Html = html, PlainText = $"From {name} <{email}>

{body}" });

                // "Reply" in Gmail goes straight to the visitor
                if (!string.IsNullOrWhiteSpace(email) && email.Contains('@'))
                {
                    message.ReplyTo.Add(new EmailAddress(email.Trim(), name));
                }

                await _emailClient.SendAsync(WaitUntil.Started, message);
                _logger.LogInformation("Contact-form email sent");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Could not send contact-form email");
                return false;
            }
        }
}
}
