using Loan_System.Modules;
using Loan_System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.RazorPages;

[ApiController]
[Route("[controller]")]
public class LoanController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LoanController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("AddLoan")]
    public async Task<IActionResult> AddNewLoan([FromBody] LoanModule loan)
    {
        await _context.LoanTable.AddAsync(loan);
        await _context.SaveChangesAsync();
        return Ok("Loan added successfully.");
    }

[Authorize]
[HttpGet("GetAllLoans")]
public async Task<IActionResult> GetAllLoan(int page = 1, int pageSize = 10)
{
    var totalCount = await _context.LoanTable.CountAsync();

    var loans = await _context.LoanTable
        .OrderByDescending(l => l.CreatedAt) // أو .OrderBy(l => l.Id) حسب الحاجة

        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    var result = new
    {
        totalCount,
        Loans = loans
    };

    return Ok(result);
}


    [Authorize]
    [HttpGet("GetLoan/{id}")]
    public async Task<IActionResult> GetLoanById(int id)
    {
        var loan = await _context.LoanTable.FindAsync(id);
        if (loan == null)
        {
            return NotFound($"Loan with ID {id} not found.");
        }
        return Ok(loan);
    }

    [Authorize]
    [HttpPut("UpdateLoan/{id}")]
    public async Task<IActionResult> UpdateLoan(int id, [FromBody] LoanModule updatedLoan)
    {
        var loan = await _context.LoanTable.FindAsync(id);
        if (loan == null)
        {
            return NotFound($"Loan with ID {id} not found.");
        }

        loan.Loan_Type = updatedLoan.Loan_Type;
        loan.LoanName = updatedLoan.LoanName;
        loan.Budget = updatedLoan.Budget;
        loan.Currency = updatedLoan.Currency;
        loan.BenfitDep = updatedLoan.BenfitDep;
        loan.Gate = updatedLoan.Gate;
        loan.DepartmentId = updatedLoan.DepartmentId;
        loan.ChapterId = updatedLoan.ChapterId;
        loan.ObjectId = updatedLoan.ObjectId;
        loan.GateType = updatedLoan.GateType;
        loan.InvestType = updatedLoan.InvestType;
        loan.ProjectType = updatedLoan.ProjectType;
        loan.Location = updatedLoan.Location;
        loan.District = updatedLoan.District;
        loan.Subdistrict = updatedLoan.Subdistrict;
        loan.GPS_X = updatedLoan.GPS_X;
        loan.GPS_Y = updatedLoan.GPS_Y;
        loan.ProjectTarget = updatedLoan.ProjectTarget;
        loan.ProjectDescription = updatedLoan.ProjectDescription;
        loan.PutYear = updatedLoan.PutYear;
        loan.NoYearTOComplete = updatedLoan.NoYearTOComplete;
        loan.ActualFinishYear = updatedLoan.ActualFinishYear;
        loan.SerialNo = updatedLoan.SerialNo;
        loan.ChangedBudget = updatedLoan.ChangedBudget;
        loan.FinalTotalBudget = updatedLoan.FinalTotalBudget;
        loan.CustomizeAnnualId = updatedLoan.CustomizeAnnualId;
        loan.customizeannual = updatedLoan.customizeannual;
        loan.ActualAnnualId = updatedLoan.ActualAnnualId;
        loan.actualannual = updatedLoan.actualannual;

        await _context.SaveChangesAsync();
        return Ok("Loan updated successfully.");
    }

    [Authorize]
    [HttpDelete("DeleteLoan/{id}")]
    public async Task<IActionResult> DeleteLoan(int id)
    {
        var loan = await _context.LoanTable.FindAsync(id);
        if (loan == null)
        {
            return NotFound($"Loan with ID {id} not found.");
        }

        _context.LoanTable.Remove(loan);
        await _context.SaveChangesAsync();
        return Ok("Loan deleted successfully.");
    }
}
