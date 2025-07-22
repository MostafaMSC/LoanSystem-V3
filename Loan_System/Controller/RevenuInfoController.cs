using Loan_System.Modules;
using Loan_System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.RazorPages;

[ApiController]
[Route("[controller]")]
public class RevenuInfoController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RevenuInfoController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("AddRevenue")]
    public async Task<IActionResult> AddNewRevenue([FromBody] RevenueInfoModule revenuInfo)
    {
        await _context.RevenueInfoTable.AddAsync(revenuInfo);
        await _context.SaveChangesAsync();
        return Ok("revenue added successfully.");
    }
    [Authorize]
    [HttpGet("GetAllRevenues")]
    public async Task<IActionResult> GetAllRevenues(int page = 1, int pageSize = 50)
    {
        var totalCount = await _context.RevenueInfoTable.CountAsync();

        var loans = await _context.RevenueInfoTable
            .OrderBy(l => l.CreatedAt) // أو .OrderBy(l => l.Id) حسب الحاجة

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
    [HttpGet("GetRevenueInfo/{id}")]
    public async Task<IActionResult> GetRevenueInfoById(int id)
    {
        var revenuInfo = await _context.RevenueInfoTable.FindAsync(id);
        if (revenuInfo == null)
        {
            return NotFound($"revenue with ID {id} not found.");
        }
        return Ok(revenuInfo);
    }

    [Authorize]
    [HttpPut("UpdateRevenue/{id}")]
    public async Task<IActionResult> UpdateRevenue(int id, [FromBody] RevenueInfoModule updatedDep)
    {
        var Revenue = await _context.RevenueInfoTable.FindAsync(id);
        if (Revenue == null)
        {
            return NotFound($"Dep with ID {id} not found.");
        }
        Revenue.RevenueName = updatedDep.RevenueName;
        Revenue.Chapter = updatedDep.Chapter;
        Revenue.Material = updatedDep.Material;
        Revenue.Section = updatedDep.Section;
        Revenue.Type = updatedDep.Type;
        Revenue.TypeDetails = updatedDep.TypeDetails;




        await _context.SaveChangesAsync();
        return Ok("Revenue updated successfully.");
    }

    [Authorize]
    [HttpDelete("DeleteRevenue/{id}")]
    public async Task<IActionResult> DeleteRevenue(int id)
    {
        var Revenue = await _context.RevenueInfoTable.FindAsync(id);
        if (Revenue == null)
        {
            return NotFound($"Loan with ID {id} not found.");
        }

        _context.RevenueInfoTable.Remove(Revenue);
        await _context.SaveChangesAsync();
        return Ok("revenue deleted successfully.");
    }
}
