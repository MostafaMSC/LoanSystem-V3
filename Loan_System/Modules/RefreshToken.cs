using Loan_System.Modules;
using Microsoft.AspNetCore.Identity;

public class RefreshToken
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public ApplicationUser User { get; set; } = new ApplicationUser();
}
