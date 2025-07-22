namespace Loan_System.Modules
{
    public class ContractDocument
    {
        public int Id { get; set; }
        public int ContractId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;

        public ContractsModule Contract { get; set; } = null!;
    }
}
