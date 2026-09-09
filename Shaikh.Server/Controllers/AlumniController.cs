using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Shaikh.Server.Models;
using System.Data;

namespace Shaikh.Server.Controllers
{
    [ApiController]
    [Route("api/alumni")]
    public class AlumniController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly ILogger<AlumniController> _logger;

        public AlumniController(IConfiguration configuration, ILogger<AlumniController> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> SaveAlumniResponse([FromBody] AlumniRequest request)
        {
            using IDbConnection db = new SqlConnection(_connectionString);

            string sql = @"
        INSERT INTO Alumni
        (
            School,
            IsAlumni
        )
        VALUES
        (
            @School,
            @IsAlumni
        );";

            await db.ExecuteAsync(sql, request);

            _logger.LogInformation("Alumni response recorded: {School} - {IsAlumni}", request.School, request.IsAlumni);

            return Ok(new { message = "Response recorded", school = request.School, isAlumni = request.IsAlumni });
        }
    }
}