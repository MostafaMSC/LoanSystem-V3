using Loan_System.Modules;
using Loan_System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

[ApiController]
[Route("[controller]")]
public class BudgetRevenueController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BudgetRevenueController> _logger;

    public BudgetRevenueController(ApplicationDbContext context, ILogger<BudgetRevenueController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost("AddRevenueCost")]
    public async Task<IActionResult> AddRevenueCost([FromBody] object rawModel)
    {
        try
        {
            // Log the raw incoming request
            var jsonString = JsonSerializer.Serialize(rawModel);
            _logger.LogInformation("Raw request received: {RawRequest}", jsonString);

            // Try to deserialize manually
            BudgetRevenue model;
            try
            {
                model = JsonSerializer.Deserialize<BudgetRevenue>(jsonString);
                _logger.LogInformation("Successfully deserialized model: {@Model}", new
                {
                    model?.RevenueId,
                    model?.Department,
                    model?.RevenueCost,
                    model?.Year,
                    model?.Month,
                    model?.Notes
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to deserialize model from: {Json}", jsonString);
                return BadRequest(new
                {
                    Error = "JSON deserialization failed",
                    Details = ex.Message,
                    ReceivedJson = jsonString
                });
            }

            // Check if model is null
            if (model == null)
            {
                _logger.LogError("Model is null after deserialization");
                return BadRequest(new { Error = "Model is null", ReceivedJson = jsonString });
            }

            // Manual validation with detailed logging
            var validationErrors = new List<string>();

            _logger.LogInformation("Starting validation...");

            // Check RevenueId
            _logger.LogDebug("Checking RevenueId: {RevenueId}", model.RevenueId);
            if (model.RevenueId <= 0)
            {
                validationErrors.Add($"RevenueId must be greater than 0. Received: {model.RevenueId}");
            }

            // Check Department
            _logger.LogDebug("Checking Department: '{Department}'", model.Department);
            if (string.IsNullOrWhiteSpace(model.Department))
            {
                validationErrors.Add($"Department is required. Received: '{model.Department}'");
            }
            else if (model.Department.Length > 255) // Assuming max length
            {
                validationErrors.Add($"Department too long. Max 255 chars, received: {model.Department.Length}");
            }

            // Check RevenueCost
            _logger.LogDebug("Checking RevenueCost: {RevenueCost}", model.RevenueCost);
            if (model.RevenueCost < 0)
            {
                validationErrors.Add($"RevenueCost must be >= 0. Received: {model.RevenueCost}");
            }

            // Check Year (if required)
            _logger.LogDebug("Checking Year: {Year}", model.Year);
            if (model.Year.HasValue && (model.Year < 1900 || model.Year > 2100))
            {
                validationErrors.Add($"Year out of range. Received: {model.Year}");
            }

            // Check Month (if required)
            _logger.LogDebug("Checking Month: {Month}", model.Month);
            if (model.Month.HasValue && (model.Month < 1 || model.Month > 12))
            {
                validationErrors.Add($"Month out of range (1-12). Received: {model.Month}");
            }

            // Check if RevenueId exists in database
            try
            {
                var revenueExists = await _context.Set<RevenueInfoModule>()
                    .AnyAsync(r => r.Id == model.RevenueId);

                _logger.LogDebug("RevenueId {RevenueId} exists in database: {Exists}", model.RevenueId, revenueExists);

                if (!revenueExists)
                {
                    validationErrors.Add($"RevenueId {model.RevenueId} does not exist in database");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if RevenueId exists");
                validationErrors.Add($"Database error checking RevenueId: {ex.Message}");
            }

            // Log validation results
            if (validationErrors.Any())
            {
                _logger.LogWarning("Validation failed: {Errors}", string.Join("; ", validationErrors));
                return BadRequest(new
                {
                    Message = "Validation Failed",
                    Errors = validationErrors,
                    ReceivedData = new
                    {
                        model.RevenueId,
                        model.Department,
                        model.RevenueCost,
                        model.Year,
                        model.Month,
                        model.Notes
                    }
                });
            }

            // Set timestamps
            model.RecordedDate = DateTime.Now;

            // If your Entity base class has CreatedAt/UpdatedAt, set them
            // model.CreatedAt = DateTime.Now; // Uncomment if needed

            // Try to save to database
            _logger.LogInformation("Attempting to save to database...");

            await _context.BudgetRevenueTable.AddAsync(model);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully saved revenue cost. ID: {Id}", model.Id);

            return Ok(new
            {
                Message = "تمت الإضافة بنجاح",
                Id = model.Id,
                Success = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in AddRevenueCost");
            return StatusCode(500, new
            {
                Message = "حدث خطأ غير متوقع",
                Error = ex.Message,
                StackTrace = ex.StackTrace
            });
        }
    }

    [HttpPut("UpdateRevenueCost/{id}")]
    public async Task<IActionResult> UpdateRevenueCost(int id, [FromBody] object rawModel)
    {
        try
        {
            // Log the raw incoming request
            var jsonString = JsonSerializer.Serialize(rawModel);
            _logger.LogInformation("Update request received for ID {Id}: {RawRequest}", id, jsonString);

            // Try to deserialize manually
            BudgetRevenue model;
            try
            {
                model = JsonSerializer.Deserialize<BudgetRevenue>(jsonString);
                _logger.LogInformation("Successfully deserialized update model: {@Model}", new
                {
                    model?.RevenueId,
                    model?.Department,
                    model?.RevenueCost,
                    model?.Year,
                    model?.Month,
                    model?.Notes
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to deserialize update model from: {Json}", jsonString);
                return BadRequest(new
                {
                    Error = "JSON deserialization failed",
                    Details = ex.Message,
                    ReceivedJson = jsonString
                });
            }

            // Check if model is null
            if (model == null)
            {
                _logger.LogError("Update model is null after deserialization");
                return BadRequest(new { Error = "Model is null", ReceivedJson = jsonString });
            }

            // Check if the record exists
            var existingRecord = await _context.BudgetRevenueTable
                .FirstOrDefaultAsync(br => br.Id == id);

            if (existingRecord == null)
            {
                _logger.LogWarning("Budget revenue record with ID {Id} not found", id);
                return NotFound(new
                {
                    Message = "السجل غير موجود",
                    Id = id
                });
            }

            // Manual validation with detailed logging
            var validationErrors = new List<string>();

            _logger.LogInformation("Starting update validation...");

            // Check RevenueId
            _logger.LogDebug("Checking RevenueId: {RevenueId}", model.RevenueId);
            if (model.RevenueId <= 0)
            {
                validationErrors.Add($"RevenueId must be greater than 0. Received: {model.RevenueId}");
            }

            // Check Department
            _logger.LogDebug("Checking Department: '{Department}'", model.Department);
            if (string.IsNullOrWhiteSpace(model.Department))
            {
                validationErrors.Add($"Department is required. Received: '{model.Department}'");
            }
            else if (model.Department.Length > 255) // Assuming max length
            {
                validationErrors.Add($"Department too long. Max 255 chars, received: {model.Department.Length}");
            }

            // Check RevenueCost
            _logger.LogDebug("Checking RevenueCost: {RevenueCost}", model.RevenueCost);
            if (model.RevenueCost < 0)
            {
                validationErrors.Add($"RevenueCost must be >= 0. Received: {model.RevenueCost}");
            }

            // Check Year (if required)
            _logger.LogDebug("Checking Year: {Year}", model.Year);
            if (model.Year.HasValue && (model.Year < 1900 || model.Year > 2100))
            {
                validationErrors.Add($"Year out of range. Received: {model.Year}");
            }

            // Check Month (if required)
            _logger.LogDebug("Checking Month: {Month}", model.Month);
            if (model.Month.HasValue && (model.Month < 1 || model.Month > 12))
            {
                validationErrors.Add($"Month out of range (1-12). Received: {model.Month}");
            }

            // Log validation results
            if (validationErrors.Any())
            {
                _logger.LogWarning("Update validation failed: {Errors}", string.Join("; ", validationErrors));
                return BadRequest(new
                {
                    Message = "Validation Failed",
                    Errors = validationErrors,
                    ReceivedData = new
                    {
                        model.RevenueId,
                        model.Department,
                        model.RevenueCost,
                        model.Year,
                        model.Month,
                        model.Notes
                    }
                });
            }

            // Update the existing record
            existingRecord.RevenueId = model.RevenueId;
            existingRecord.Department = model.Department;
            existingRecord.RevenueCost = model.RevenueCost;
            existingRecord.Year = model.Year;
            existingRecord.Month = model.Month;
            existingRecord.Notes = model.Notes;

            // Update timestamp
            existingRecord.RecordedDate = DateTime.Now;

            // If your Entity base class has UpdatedAt, set it
            // existingRecord.UpdatedAt = DateTime.Now; // Uncomment if needed

            // Try to save changes to database
            _logger.LogInformation("Attempting to update record in database...");

            _context.BudgetRevenueTable.Update(existingRecord);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully updated revenue cost. ID: {Id}", id);

            return Ok(new
            {
                Message = "تم التحديث بنجاح",
                Id = id,
                Success = true,
                UpdatedRecord = new
                {
                    existingRecord.Id,
                    existingRecord.RevenueId,
                    existingRecord.Department,
                    existingRecord.RevenueCost,
                    existingRecord.Year,
                    existingRecord.Month,
                    existingRecord.Notes,
                    existingRecord.RecordedDate
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in UpdateRevenueCost for ID {Id}", id);
            return StatusCode(500, new
            {
                Message = "حدث خطأ غير متوقع أثناء التحديث",
                Error = ex.Message,
                StackTrace = ex.StackTrace,
                Id = id
            });
        }
    }

    [HttpGet("GetAllRevenuesCost")]
    public async Task<IActionResult> GetAllRevenuesCost(int page = 1, int pageSize = 50)
    {
        try
        {
            var totalCount = await _context.BudgetRevenueTable.CountAsync();

            var revenues = await _context.BudgetRevenueTable
                .OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                totalCount,
                Revenues = revenues
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching revenue costs");
            return StatusCode(500, new { Message = "خطأ في جلب البيانات", Error = ex.Message });
        }
    }

    [HttpGet("CheckExisting")]
    public async Task<IActionResult> CheckExisting(int revenueId, string department, int year, int month)
    {
        try
        {
            var exists = await _context.BudgetRevenueTable
                .AnyAsync(br => br.RevenueId == revenueId
                             && br.Department == department
                             && br.Year == year
                             && br.Month == month);

            return Ok(new { exists = exists });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking existing revenue cost entry");
            return StatusCode(500, new
            {
                Message = "خطأ في التحقق من البيانات",
                Error = ex.Message
            });
        }
    }

    [HttpGet("GetRevenueCostById/{id}")]
    public async Task<IActionResult> GetRevenueCostById(int id)
    {
        try
        {
            var revenue = await _context.BudgetRevenueTable
                .FirstOrDefaultAsync(br => br.Id == id);

            if (revenue == null)
            {
                return NotFound(new
                {
                    Message = "السجل غير موجود",
                    Id = id
                });
            }

            return Ok(revenue);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching revenue cost by ID {Id}", id);
            return StatusCode(500, new
            {
                Message = "خطأ في جلب البيانات",
                Error = ex.Message
            });
        }
    }

    [HttpDelete("DeleteRevenueCostById/{id}")]
    public async Task<IActionResult> DeleteRevenueCostById(int id)
    {
        var Reve = await _context.BudgetRevenueTable.FindAsync(id);
        if (Reve == null)
        {
            return NotFound($"Loan with ID {id} not found.");
        }

        _context.BudgetRevenueTable.Remove(Reve);
        await _context.SaveChangesAsync();
        return Ok("Revenue deleted successfully.");
    }

    [HttpGet("GetReportByDateAndDep")]
    public async Task<IActionResult> GetRevenueReport(int year, int month, string? department)
{
    try
    {
        var query = _context.BudgetRevenueTable
            .Include(br => br.RevenueInfo)
            .Where(br => br.Month == month && br.Year == year);

        if (!string.IsNullOrWhiteSpace(department))
        {
            query = query.Where(br => br.Department == department);
            _logger.LogInformation("Fetching revenue report for Department: {Department}, Year: {Year}, Month: {Month}", 
                department, year, month);
        }
        else
        {
            _logger.LogInformation("Fetching revenue report for all departments for Year: {Year}, Month: {Month}", 
                year, month);
        }

        var reports = await query.OrderBy(br => br.RecordedDate).ToListAsync();

        _logger.LogInformation("Found {Count} revenue records", reports.Count);

        return Ok(reports);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error fetching revenue report for Department: {Department}, Year: {Year}, Month: {Month}", 
            department, year, month);
        return StatusCode(500, new
        {
            Message = "خطأ في جلب تقرير الإيرادات",
            Error = ex.Message
        });
    }
}

}