using System.ComponentModel.DataAnnotations;

public class RevenueInfoModule : Entity
{
    [Required]
    [StringLength(100)]
    public string RevenueName { get; set; }
    public string Section { get; set; }
    public string Chapter { get; set; }
    public string Material { get; set; }
    public string Type { get; set; }
    public string TypeDetails { get; set; }
}