public abstract class Entity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    public string EnteredUserName { get; set; } = string.Empty;
    public void MarkUpdated() => UpdatedAt = DateTime.Now;
    
}