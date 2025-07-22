using System.ComponentModel.DataAnnotations;

namespace Loan_System.Modules
{
    public class AssignRoleModel
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty;
    }
}