using Loan_System.Modules;
using Microsoft.AspNetCore.Identity;

public class RefreshToken
{
    public int Id { get; set; }
    public string Token { get; set; }
    public string UserId { get; set; }
    public DateTime ExpiryDate { get; set; }
    public ApplicationUser  User { get; set; }
}
