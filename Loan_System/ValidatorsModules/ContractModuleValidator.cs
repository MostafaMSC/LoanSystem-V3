using FluentValidation;
using Loan_System.Modules;
public class ContractModuleValidator : AbstractValidator<ContractsModule>
{
    public ContractModuleValidator()
    {
        RuleFor(x => x.ContractType)
            .NotEmpty().WithMessage("Contract type is required.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required.")
            .Must(startDate => startDate <= DateTime.Now).WithMessage("Start date cannot be in the future.");

        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Contract status is required.");
    }
}
