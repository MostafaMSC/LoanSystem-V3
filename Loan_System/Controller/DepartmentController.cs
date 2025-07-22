using Loan_System.Modules;
using Loan_System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.RazorPages;

[ApiController]
[Route("[controller]")]
public class DepartmentController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DepartmentController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("AddDep")]
    public async Task<IActionResult> AddNewLoan([FromBody] DepartmentModule loan)
    {
        await _context.DepartmentTable.AddAsync(loan);
        await _context.SaveChangesAsync();
        return Ok("Department added successfully.");
    }

[HttpGet("GetAllDep")]
public async Task<IActionResult> GetAllDep(int page = 1, int pageSize = 20)
{
    var totalCount = await _context.DepartmentTable.CountAsync();

    var departments = await _context.DepartmentTable
        .OrderBy(l => l.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

        // FIX: Return departments directly or fix the property name
        // Option 1: Return just the departments array
        // return Ok(departments);

        // Option 2: Fix the property name to match what frontend expects
        var result = new
        {
            totalCount,
            departments = departments
    };

    return Ok(result);
}

    [Authorize]
    [HttpGet("GetDep/{id}")]
    public async Task<IActionResult> GetDepById(int id)
    {
        var loan = await _context.DepartmentTable.FindAsync(id);
        if (loan == null)
        {
            return NotFound($"Dep with ID {id} not found.");
        }
        return Ok(loan);
    }

    [Authorize]
    [HttpPut("UpdateDep/{id}")]
    public async Task<IActionResult> UpdateDep(int id, [FromBody] DepartmentModule updatedDep)
    {
        var Dep = await _context.DepartmentTable.FindAsync(id);
        if (Dep == null)
        {
            return NotFound($"Dep with ID {id} not found.");
        }

       
        Dep.DepartmentName = updatedDep.DepartmentName;

        await _context.SaveChangesAsync();
        return Ok("Loan updated successfully.");
    }

    [Authorize]
    [HttpDelete("DeleteDep/{id}")]
    public async Task<IActionResult> DeleteDep(int id)
    {
        var Dep = await _context.DepartmentTable.FindAsync(id);
        if (Dep == null)
        {
            return NotFound($"Loan with ID {id} not found.");
        }

        _context.DepartmentTable.Remove(Dep);
        await _context.SaveChangesAsync();
        return Ok("Dep deleted successfully.");
    }
}
