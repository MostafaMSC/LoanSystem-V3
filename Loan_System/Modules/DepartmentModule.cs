using System.ComponentModel.DataAnnotations;

public class DepartmentModule : Entity
{
    [Required]
    [StringLength(100)]
    public string DepartmentName { get; set; } = string.Empty;

    // Navigation property for related budget revenues
    public virtual ICollection<BudgetRevenue> BudgetRevenues { get; set; } = new List<BudgetRevenue>();
}