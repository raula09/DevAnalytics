using MongoDB.Bson;
using MongoDB.Driver;
using Server.Models;

namespace Server.Services;
public class AnalyticsService
{
    private readonly IMongoCollection<AnalyticsRecord> _collection;
    public AnalyticsService(IConfiguration cfg, IMongoClient client)
    {
        var db = client.GetDatabase(cfg["Mongo:Database"] ?? "devanalytics");
        _collection = db.GetCollection<AnalyticsRecord>("records");
        _collection.Indexes.CreateOne(new CreateIndexModel<AnalyticsRecord>(
            Builders<AnalyticsRecord>.IndexKeys.Ascending(x => x.UserId).Ascending(x => x.LanguageId)
        ));
    }
    public Task InsertAsync(AnalyticsRecord rec) => _collection.InsertOneAsync(rec);
    public Task InsertManyAsync(IEnumerable<AnalyticsRecord> recs) => _collection.InsertManyAsync(recs);
    public async Task<List<AnalyticsRecord>> ForUserAsync(string userId) =>
        await _collection.Find(Builders<AnalyticsRecord>.Filter.Eq(x => x.UserId, userId)).ToListAsync();
    public async Task<object> SummaryAsync() => await _collection.Aggregate<object>(new[] {
        new BsonDocument("$group", new BsonDocument { 
            { "_id", "$LanguageId" },
            { "seconds", new BsonDocument("$sum", "$Seconds") },
            { "filesOpened", new BsonDocument("$sum", "$FilesOpened") },
            { "keystrokes", new BsonDocument("$sum", "$Keystrokes") }
        })
    }).ToListAsync();
    public async Task<List<string>> GetAllUsersAsync() =>
        await _collection.Distinct<string>("UserId", Builders<AnalyticsRecord>.Filter.Empty).ToListAsync();
}
