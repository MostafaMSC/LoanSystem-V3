using Microsoft.AspNetCore.Identity;

namespace Loan_System.Modules
{
    public class ApplicationUser : IdentityUser
    {
        public int? DepartmentId { get; set; }
    }
}
