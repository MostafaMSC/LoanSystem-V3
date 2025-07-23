public class NonSovereignRevenueResponseDto
{
    public int Id { get; set; }
    public string Department { get; set; } = string.Empty;
    public decimal MinistryShare { get; set; }
    public decimal FinanceShare { get; set; }
    public decimal ResourceMaximizationInsurance { get; set; }
    public int? Year { get; set; }
    public int? Month { get; set; }
    public DateTime? RecordedDate { get; set; }
    public string? Notes { get; set; }
}
