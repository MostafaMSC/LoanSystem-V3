using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class NonSovereignRevenues : Entity
{
    [Required]
    public string Department { get; set; } = string.Empty;

    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "Ministry share must be a positive value")]
    public decimal MinistryShare { get; set; }

    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "Finance share must be a positive value")]
    public decimal FinanceShare { get; set; }

    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "Resource Maximization Insurance must be a positive value")]
    public decimal ResourceMaximizationInsurance { get; set; }

    public int? Year { get; set; }
    public int? Month { get; set; }
    public DateTime? RecordedDate { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}
