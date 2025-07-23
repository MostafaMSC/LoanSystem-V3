using System.ComponentModel.DataAnnotations;

public class RevenueInfoModule : Entity
{
    [Required]
    [StringLength(100)]
    public string RevenueName { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public string Chapter { get; set; } = string.Empty;
    public string Material { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string TypeDetails { get; set; } = string.Empty;
}