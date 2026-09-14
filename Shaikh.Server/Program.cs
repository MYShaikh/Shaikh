using Azure.Communication.Email;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Serilog;
using Shaikh.Server.Services;


Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File(
    Path.Combine(Environment.GetEnvironmentVariable("HOME") ?? ".", "LogFiles", "Application", "log-.txt"),
    rollingInterval: RollingInterval.Day)
    .CreateLogger();


var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog();

string dbServer = builder.Configuration["DatabaseSettings:Server"];
string dbName = builder.Configuration["DatabaseSettings:Database"];
string dbUser = builder.Configuration["DatabaseSettings:UserId"];
string dbPass = builder.Configuration["DatabaseSettings:Password"];

string dynamicConnectionString = $"Server={dbServer};Database={dbName};User Id={dbUser};Password={dbPass};TrustServerCertificate=True;Encrypt=True;";
Console.WriteLine($"[DB] Connecting to Server={dbServer} Database={dbName}");

string emailConnectionString = builder.Configuration["EmailSettings:ConnectionString"];
if (!string.IsNullOrWhiteSpace(emailConnectionString))
{
    builder.Services.AddSingleton(provider => new EmailClient(emailConnectionString));
    builder.Services.AddSingleton<IAttendanceEmail, AttendanceEmailService>();
}
else
{
    Log.Warning("EmailSettings:ConnectionString is not set - milestone emails are DISABLED.");
    builder.Services.AddSingleton<IAttendanceEmail, NoOpAttendanceEmail>();
}

builder.Configuration["ConnectionStrings:DefaultConnection"] = dynamicConnectionString;

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddDbContext<PortfolioContext>(options =>
    options.UseSqlServer(dynamicConnectionString));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy =>
        {
            policy.WithOrigins("https://localhost:64262") // Your Angular frontend port
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddHttpClient();
var app = builder.Build();
app.UseSerilogRequestLogging();

app.UseCors("AllowAngular");
app.UseDefaultFiles();
app.MapStaticAssets();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();
