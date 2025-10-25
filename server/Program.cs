using MongoDB.Driver;
using Server.Models;
using Server.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .WithOrigins("http://localhost:5173"));
});

var mongoUri = Environment.GetEnvironmentVariable("MONGODB_URI") 
               ?? "mongodb://localhost:27017";
Console.WriteLine($"Using MongoDB at: {mongoUri}");

builder.Services.AddSingleton<IMongoClient>(_ => new MongoClient(mongoUri));
builder.Services.AddSingleton<AnalyticsService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/api/health", () =>
{
    return Results.Ok(new
    {
        ok = true,
        timestamp = DateTime.UtcNow
    });
});

app.MapPost("/api/analytics", async (AnalyticsRecord record, AnalyticsService service) =>
{
    record.Timestamp = DateTime.UtcNow;
    await service.InsertAsync(record);
    return Results.Ok(new { ok = true });
});

app.MapPost("/api/analytics/batch", async (List<AnalyticsRecord> records, AnalyticsService service) =>
{
    foreach (var r in records)
        r.Timestamp = DateTime.UtcNow;

    if (records.Count > 0)
        await service.InsertManyAsync(records);

    return Results.Ok(new { ok = true, count = records.Count });
});

app.MapGet("/api/analytics/user/{userId}", async (string userId, DateTime? from, DateTime? to, AnalyticsService service) =>
{
    var list = await service.ForUserAsync(userId, from, to);
    return Results.Ok(list);
});

app.MapGet("/api/analytics/summary", async (DateTime? from, DateTime? to, AnalyticsService service) =>
{
    var summary = await service.SummaryAsync(from, to);
    return Results.Ok(summary);
});

app.Run();
