using Loan_System.Modules;

namespace Loan_System.Services.Interface;

public interface IConract
{
    Task<string> AddNewContract(ContractCreateDto contracts);
    Task<object> GetAllContracts(int page, int pageSize);
    Task<List<ContractsModule>> GetAllContractsByLoanId(int loanId, int page, int pageSize);
    Task<ContractsModule?> GetContractById(int id);
    Task<string> UpdateContract(int id, ContractCreateDto updatedContract);
    Task<string> DeleteContract(int id);
    Task<string> UploadContractDocuments(ContractDocumentUploadDto dto);
    Task<List<ContractDocument>> GetDocumentsByContractId(int contractId);

    
    Task<List<CashPaidPayments>> GetPaymentsByContractId(int contractId);
    Task<List<PrivateMoneyPayments>> GetPrivatePaymentsByContractId(int contractId);
    Task<string> DeletePrivatePayment(int paymentId);
    Task<string> DeletePayment(int paymentId);

}
