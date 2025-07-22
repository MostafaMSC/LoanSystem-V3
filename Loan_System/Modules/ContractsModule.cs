    // Models/LoginRequest.cs
    using System.ComponentModel.DataAnnotations;
    using Microsoft.EntityFrameworkCore;

    namespace Loan_System.Modules
{
    public class ContractsModule : Entity
    {
        // Identification
        public string ContractNumber { get; set; } = string.Empty;
        public string ContractName { get; set; } = string.Empty;
        public ContractType ContractType { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int? LoanId { get; set; }

        // Dates
        public DateTime? ContractSigningDate { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? CompleteDate { get; set; }

        public int? DurationInDays { get; set; }
        public int? AddedDays { get; set; }

        [Precision(18, 2)]
        public decimal? ContractAmount { get; set; }
        [Precision(18, 2)]
        public decimal? CostChange { get; set; }
        [Precision(18, 2)]
        public decimal? CostPlanMins { get; set; }
        [Precision(18, 2)]
        public decimal? CostAfterChange { get; set; }
        [Precision(18, 2)]
        public decimal? CostToNatiBank { get; set; }
        [Precision(18, 2)]
        public decimal? TotalCostPaid { get; set; }
        [Precision(18, 2)]
        public decimal? OperationLoanCost { get; set; }
        [Precision(18, 2)]
        public decimal? TaxesAndBlockedmoney { get; set; }
        
        public ICollection<CashPaidPayments> CashPaid { get; set; } = new List<CashPaidPayments>();
        public ICollection<PrivateMoneyPayments> PrivateMoneyPaid { get; set; } = new List<PrivateMoneyPayments>();

        public string? Notes { get; set; } = string.Empty;
        public List<ContractDocument> Documents { get; set; } = new();

        public void CalculateCostAfterChange()
        {
            CostAfterChange = (ContractAmount ?? 0) + (CostChange ?? 0);
        }
    }

        
    }
