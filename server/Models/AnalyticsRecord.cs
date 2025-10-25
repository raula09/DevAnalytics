namespace Server.Models;
public class AnalyticsRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = "unknown";
    public string Workspace { get; set; } = "default";
    public string LanguageId { get; set; } = "unknown";
    public int Seconds { get; set; } = 0;
    public int FilesOpened { get; set; } = 0;
    public int Keystrokes { get; set; } = 0;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
