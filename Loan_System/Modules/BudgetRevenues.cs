
    // Main budget revenue entity (renamed for clarity)
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class BudgetRevenue : Entity
    {
        [Required]
        public int RevenueId { get; set; } // Fixed typo: "RevenuId" -> "RevenueId"
        
        [ForeignKey("RevenueId")]
        public virtual RevenueInfoModule RevenueInfo { get; set; } // Better naming
        
        [Required]
        public string Department { get; set; }
                
        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Revenue cost must be positive")]
        public decimal RevenueCost { get; set; } // Changed to decimal for currency
        
        // Additional fields that might be useful based on your report
        public int? Year { get; set; }
        public int? Month { get; set; }
        public DateTime? RecordedDate { get; set; }
        
        [StringLength(500)]
        public string? Notes { get; set; }
    }