using Azure.Communication.Email;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Serilog;
using Shaikh.Server.Services;


Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();


var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog();

string dbServer = builder.Configuration["DatabaseSettings:Server"];
string dbName = builder.Configuration["DatabaseSettings:Database"];
string dbUser = builder.Configuration["DatabaseSettings:UserId"];
string dbPass = builder.Configuration["DatabaseSettings:Password"];

string dynamicConnectionString = $"Server={dbServer};Database={dbName};User Id={dbUser};Password={dbPass};TrustServerCertificate=True;Encrypt=True;";
Console.WriteLine($"[DB] Connecting to Server={dbServer} Database={dbName}");

builder.Services.AddSingleton(provider =>
{
    var configuration = provider.GetRequiredService<IConfiguration>();
    string connectionString = configuration["EmailSettings:ConnectionString"];
    return new EmailClient(connectionString);
});

builder.Services.AddSingleton<IConfiguration>(provider =>
{
    var configBuilder = new ConfigurationBuilder()
        .AddConfiguration(builder.Configuration)
        .AddInMemoryCollection(new Dictionary<string, string>
        {
            {"ConnectionStrings:DefaultConnection", dynamicConnectionString}
        });
    return configBuilder.Build();
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSingleton<IAttendanceEmail, AttendanceEmailService>();
builder.Services.AddDbContext<PortfolioContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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