using MongoDB.Bson;
using MongoDB.Driver;
using Server.Models;

namespace Server.Services;

public class AnalyticsService
{
    private readonly IMongoCollection<AnalyticsRecord> _collection;
    public AnalyticsService(IConfiguration cfg, IMongoClient client)
    {
        var dbName = cfg["Mongo:Database"] ?? "devanalytics";
        var db = client.GetDatabase(dbName);
        _collection = db.GetCollection<AnalyticsRecord>("records");
        _collection.Indexes.CreateOne(
            new CreateIndexModel<AnalyticsRecord>(
                Builders<AnalyticsRecord>.IndexKeys.Ascending(x => x.UserId).Ascending(x => x.LanguageId)
            )
        );
    }

    public async Task InsertAsync(AnalyticsRecord rec) => await _collection.InsertOneAsync(rec);
    public async Task InsertManyAsync(IEnumerable<AnalyticsRecord> recs) => await _collection.InsertManyAsync(recs);

    public async Task<List<AnalyticsRecord>> ForUserAsync(string userId, DateTime? from = null, DateTime? to = null)
    {
        var filter = Builders<AnalyticsRecord>.Filter.Eq(x => x.UserId, userId);
        if (from.HasValue) filter &= Builders<AnalyticsRecord>.Filter.Gte(x => x.Timestamp, from.Value);
        if (to.HasValue) filter &= Builders<AnalyticsRecord>.Filter.Lte(x => x.Timestamp, to.Value);
        return await _collection.Find(filter).ToListAsync();
    }

    public async Task<object> SummaryAsync(DateTime? from = null, DateTime? to = null)
    {
        var filter = Builders<AnalyticsRecord>.Filter.Empty;
        if (from.HasValue) filter &= Builders<AnalyticsRecord>.Filter.Gte(x => x.Timestamp, from.Value);
        if (to.HasValue) filter &= Builders<AnalyticsRecord>.Filter.Lte(x => x.Timestamp, to.Value);

        var pipeline = new[]
        {
            new BsonDocument("$match", filter.Render(_collection.DocumentSerializer, _collection.Settings.SerializerRegistry)),
            new BsonDocument("$group", new MongoDB.Bson.BsonDocument{
                { "_id", new MongoDB.Bson.BsonDocument{
                    { "userId", "$UserId" },
                    { "languageId", "$LanguageId" }
                }},
                { "seconds", new MongoDB.Bson.BsonDocument("$sum", "$Seconds") },
                { "filesOpened", new MongoDB.Bson.BsonDocument("$sum", "$FilesOpened") },
                { "keystrokes", new MongoDB.Bson.BsonDocument("$sum", "$Keystrokes") }
            }),
            new BsonDocument("$project", new MongoDB.Bson.BsonDocument{
                { "userId", "$_id.userId" },
                { "languageId", "$_id.languageId" },
                { "_id", 0 },
                { "seconds", 1 },
                { "filesOpened", 1 },
                { "keystrokes", 1 }
            })
        };

        var result = await _collection.Aggregate<object>(pipeline).ToListAsync();
        return result;
    }
}
