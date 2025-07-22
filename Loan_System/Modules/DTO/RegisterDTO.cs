// Models/LoginRequest.cs
namespace Loan_System.Modules.DTO
{
    public class RegisterDTO
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
        public int DepartmentId { get; set; } // ✅ Required

    }
}
