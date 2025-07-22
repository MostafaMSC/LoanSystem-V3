using FluentValidation;
using Loan_System.Modules;
using Loan_System.Modules.DTO;

public class RegisterModuleValidator : AbstractValidator<RegisterDTO>
{
    public RegisterModuleValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.")
            .Length(3, 50).WithMessage("Username must be between 3 and 50 characters.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .Length(6, 100).WithMessage("Password must be between 6 and 100 characters.");

    }
}
