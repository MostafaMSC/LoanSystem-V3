using Loan_System.Modules;
public class ContractCreateDto
{
    public string ContractNumber { get; set; } = string.Empty;
    public string ContractName { get; set; } = string.Empty;

    // IMPORTANT: Change this from string to int to match the enum value being sent from frontend
    public ContractType ContractType { get; set; }

    public string CompanyName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int? LoanId { get; set; }
    public DateTime? ContractSigningDate { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? CompleteDate { get; set; }
    public int? DurationInDays { get; set; }
    public int? AddedDays { get; set; }
    public decimal? ContractAmount { get; set; }
    public decimal? CostChange { get; set; }
    public decimal? CostPlanMins { get; set; }
    public decimal? CostAfterChange { get; set; }
    public decimal? CostToNatiBank { get; set; }
    public decimal? TotalCostPaid { get; set; }
    public decimal? OperationLoanCost { get; set; }
    public decimal? TaxesAndBlockedmoney { get; set; }
    public string Notes { get; set; } = string.Empty;

    public List<PaymentDto>? CashPaid { get; set; } = new List<PaymentDto>();
    public List<PaymentDto>? PrivateMoneyPaid { get; set; } = new List<PaymentDto>();

    // Alternative property names for frontend compatibility
    public List<PaymentDto>? CashPaidPayments { get; set; }
    public List<PaymentDto>? PrivatePaidPayments { get; set; }
}