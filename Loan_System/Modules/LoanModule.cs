using System.ComponentModel.DataAnnotations;

namespace Loan_System.Modules
{
    public class LoanModule : Entity
    {
        public required string LoanName { get; set; }
        public decimal Budget { get; set; }
        public LoanType Loan_Type { get; set; }
        public string? Currency { get; set; }
        public string? BenfitDep { get; set; }

        public int? Gate { get; set; }
        public int? DepartmentId { get; set; }

        public int? ChapterId { get; set; }
        public int? ObjectId { get; set; }
        public int? GateType { get; set; }
        public int? InvestType { get; set; }
        public int? SerialNo { get; set; }
        public ProjectType ProjectType { get; set; }
        [Required]
        public string Location { get; set; }

        public string? District { get; set; }

        public string? Subdistrict { get; set; }

        // [RegularExpression(@"^-?\d+(\.\d+)?$", ErrorMessage = "Invalid GPS X coordinate")]
        public string? GPS_X { get; set; }

        // [RegularExpression(@"^-?\d+(\.\d+)?$", ErrorMessage = "Invalid GPS Y coordinate")]
        public string? GPS_Y { get; set; }

        public string? ProjectTarget { get; set; }
        public string? ProjectDescription { get; set; }
        public int? PutYear { get; set; }
        public int? NoYearTOComplete { get; set; }
        public int? ActualFinishYear { get; set; }
        public decimal ChangedBudget { get; set; }
        public decimal FinalTotalBudget { get; set; }
        public int? CustomizeAnnualId { get; set; }
        public Customizeannual? customizeannual { get; set; }
        public int? ActualAnnualId { get; set; }
        public ActualExpenseannual? actualannual { get; set; } 
    }
}
