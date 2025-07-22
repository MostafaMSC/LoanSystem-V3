using FluentValidation;
using Loan_System.Modules;

public class LoanModuleValidator : AbstractValidator<LoanModule>
{
    public LoanModuleValidator()
    {
        // Validate that the loan budget is greater than zero
        RuleFor(x => x.Budget)
            .GreaterThan(0).WithMessage("Loan amount must be greater than zero.");

        // Validate that the loan name is not empty
        RuleFor(x => x.LoanName)
            .NotEmpty().WithMessage("Loan name cannot be empty.")
            .MaximumLength(100).WithMessage("Loan name cannot exceed 100 characters.");

        // Validate that the currency is not empty (assuming Currency is a string)
        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency cannot be empty.")
            .MaximumLength(10).WithMessage("Currency code cannot exceed 10 characters.");
    }
}
