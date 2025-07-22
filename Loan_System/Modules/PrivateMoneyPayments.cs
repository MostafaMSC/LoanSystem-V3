
namespace Loan_System.Modules
{
    public class PrivateMoneyPayments
    {
        public int Id { get; set; }
        public int ContractId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
    }
}