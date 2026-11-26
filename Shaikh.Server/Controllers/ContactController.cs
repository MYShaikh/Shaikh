using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Shaikh.Server.Models; // adjust this if ContactModel.cs lives in a different namespace
using Shaikh.Server.Services;
using System.Data;

namespace Shaikh.Server.Controllers
{
    [ApiController]
    [Route("api/contact")]
    public class ContactController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly IAttendanceEmail _email;
        private readonly ILogger<ContactController> _logger;

        public ContactController(IConfiguration configuration, IAttendanceEmail email, ILogger<ContactController> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _email = email;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitContact([FromBody] ContactModel request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Subject) ||
                string.IsNullOrWhiteSpace(request.Body))
            {
                return BadRequest(new { message = "Name, Email, Subject, and Body are all required." });
            }

            // 1) Save it in the database (dbo.Contacts)
            bool saved = false;
            try
            {
                using IDbConnection db = new SqlConnection(_connectionString);

                string sql = @"
            INSERT INTO dbo.Contacts
            (
                Name,
                Email,
                Subject,
                Body
            )
            VALUES
            (
                @Name,
                @Email,
                @Subject,
                @Body
            );";

                await db.ExecuteAsync(sql, request);
                saved = true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Could not save contact message to the database");
            }

            // 2) Email me a copy (Reply-To is the visitor)
            bool emailed = await _email.NotifyContactAsync(request.Name, request.Email, request.Subject, request.Body);

            // The message only counts as lost if both failed
            if (!saved && !emailed)
            {
                return StatusCode(500, new { message = "Sorry, your message could not be sent. Please try again." });
            }

            return Ok(new { message = "Message received. Thank you for reaching out!" });
        }
    }
}