using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Loan_System.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UploadFolderController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<UploadFolderController> _logger;

        private const long MaxFileSize = 50 * 1024 * 1024; // 50MB per file
        private const long MaxTotalUploadSize = 500 * 1024 * 1024; // 500MB per upload
        private readonly string[] AllowedExtensions = 
        { 
            ".pdf", ".doc", ".docx", ".xls", ".xlsx", 
            ".jpg", ".jpeg", ".png", ".gif", ".txt", ".zip"
        };

        public UploadFolderController(IWebHostEnvironment env, ILogger<UploadFolderController> logger)
        {
            _env = env;
            _logger = logger;
        }

        private string GetBasePath(long contractId)
        {
            if (contractId <= 0)
                throw new ArgumentException("معرف العقد غير صحيح");
            
            return Path.Combine(Directory.GetCurrentDirectory(), "UploadedContracts", contractId.ToString());
        }

        private bool IsValidFileExtension(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return AllowedExtensions.Contains(extension);
        }

        private bool IsSafeFileName(string fileName)
        {
            if (fileName.Contains("..") || fileName.Contains("~"))
                return false;
            
            var invalidChars = Path.GetInvalidFileNameChars();
            return !fileName.Any(c => invalidChars.Contains(c));
        }

        [HttpPost("UploadContractDocuments")]
        public async Task<IActionResult> UploadContractDocuments([FromForm] long ContractId)
        {
            try
            {
                var files = Request.Form.Files;
                if (files.Count == 0)
                    return BadRequest(new { error = "لم يتم رفع أي ملفات" });

                if (ContractId <= 0)
                    return BadRequest(new { error = "معرف العقد غير صحيح" });

                var rootPath = GetBasePath(ContractId);
                
                // Check total upload size
                var totalSize = files.Sum(f => f.Length);
                if (totalSize > MaxTotalUploadSize)
                    return BadRequest(new { error = $"حجم الملفات المرفوعة يتجاوز الحد الأقصى ({MaxTotalUploadSize / (1024 * 1024)}MB)" });

                Directory.CreateDirectory(rootPath);

                var uploadedFiles = new List<string>();
                var failedFiles = new List<string>();

                foreach (var file in files)
                {
                    try
                    {
                        // Validate file size
                        if (file.Length > MaxFileSize)
                        {
                            failedFiles.Add($"{file.FileName} - يتجاوز الحد الأقصى للحجم");
                            continue;
                        }

                        // Get the relative path from the form (this preserves the folder structure)
                        // webkitRelativePath will contain the full path including folders
                        var relativePath = file.FileName ?? file.Name;
                        
                        // Clean the path
                        relativePath = Path.GetRelativePath("/", relativePath).TrimStart('/', '\\');
                        
                        // For files uploaded with webkitdirectory, FileName already contains the relative path
                        // No need to do additional path extraction
                        
                        // Validate file extension
                        if (!IsValidFileExtension(relativePath))
                        {
                            failedFiles.Add($"{relativePath} - نوع الملف غير مسموح");
                            continue;
                        }

                        // Validate each path segment
                        var pathSegments = relativePath.Split(new[] { '/', '\\' }, StringSplitOptions.RemoveEmptyEntries);
                        if (pathSegments.Any(segment => !IsSafeFileName(segment)))
                        {
                            failedFiles.Add($"{relativePath} - اسم ملف غير آمن");
                            continue;
                        }

                        var savePath = Path.Combine(rootPath, relativePath);
                        
                        // Security check: ensure the save path is within the contract directory
                        var fullRootPath = Path.GetFullPath(rootPath);
                        var fullSavePath = Path.GetFullPath(savePath);
                        
                        if (!fullSavePath.StartsWith(fullRootPath))
                        {
                            failedFiles.Add($"{relativePath} - محاولة وصول غير مصرح");
                            _logger.LogWarning($"Attempted directory traversal for contract {ContractId}: {relativePath}");
                            continue;
                        }

                        // Create the directory structure
                        var dir = Path.GetDirectoryName(fullSavePath);
                        if (!string.IsNullOrEmpty(dir))
                        {
                            Directory.CreateDirectory(dir);
                        }

                        // Save the file
                        await using var stream = System.IO.File.Create(fullSavePath);
                        await file.CopyToAsync(stream);
                        
                        uploadedFiles.Add(relativePath);
                        _logger.LogInformation($"Successfully uploaded: {relativePath} for contract {ContractId}");
                    }
                    catch (Exception ex)
                    {
                        failedFiles.Add($"{file.FileName} - خطأ: {ex.Message}");
                        _logger.LogError($"Error uploading {file.FileName}: {ex.Message}");
                    }
                }

                if (uploadedFiles.Count == 0)
                    return BadRequest(new { error = "فشل في رفع جميع الملفات", details = failedFiles });

                return Ok(new 
                { 
                    message = $"تم رفع {uploadedFiles.Count} ملف بنجاح",
                    uploadedFiles = uploadedFiles,
                    failedFiles = failedFiles.Count > 0 ? failedFiles : null
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Unexpected error in UploadContractDocuments: {ex.Message}");
                return StatusCode(500, new { error = "حدث خطأ غير متوقع أثناء الرفع" });
            }
        }

        [HttpGet("GetContractDocuments")]
        public IActionResult GetContractDocuments(long contractId)
        {
            try
            {
                if (contractId <= 0)
                    return BadRequest(new { error = "معرف العقد غير صحيح" });

                var basePath = GetBasePath(contractId);
                if (!Directory.Exists(basePath))
                    return Ok(new List<string>());

                var files = Directory
                    .GetFiles(basePath, "*.*", SearchOption.AllDirectories)
                    .Select(path => 
                    {
                        // Return relative path with forward slashes for consistency
                        var relativePath = Path.GetRelativePath(basePath, path);
                        return relativePath.Replace("\\", "/");
                    })
                    .ToList();

                return Ok(files);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetContractDocuments: {ex.Message}");
                return StatusCode(500, new { error = "حدث خطأ أثناء جلب الملفات" });
            }
        }

        [HttpGet("GetFile")]
        public IActionResult GetFile(long contractId, [FromQuery] string filePath)
        {
            try
            {
                if (contractId <= 0)
                    return BadRequest(new { error = "معرف العقد غير صحيح" });

                if (string.IsNullOrEmpty(filePath))
                    return BadRequest(new { error = "مسار الملف مفقود" });

                var basePath = GetBasePath(contractId);
                var requestedPath = Path.Combine(basePath, filePath);
                
                // Security check
                var fullBasePath = Path.GetFullPath(basePath);
                var fullRequestedPath = Path.GetFullPath(requestedPath);
                
                if (!fullRequestedPath.StartsWith(fullBasePath))
                {
                    _logger.LogWarning($"Attempted unauthorized file access for contract {contractId}: {filePath}");
                    return Forbid();
                }

                if (!System.IO.File.Exists(fullRequestedPath))
                    return NotFound(new { error = "الملف غير موجود" });

                var fileBytes = System.IO.File.ReadAllBytes(fullRequestedPath);
                var contentType = GetMimeType(fullRequestedPath);
                
                return File(fileBytes, contentType, Path.GetFileName(fullRequestedPath));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetFile: {ex.Message}");
                return StatusCode(500, new { error = "حدث خطأ أثناء استرجاع الملف" });
            }
        }

        [HttpGet("DownloadContractDocuments")]
        public IActionResult DownloadContractDocuments(long contractId)
        {
            try
            {
                if (contractId <= 0)
                    return BadRequest(new { error = "معرف العقد غير صحيح" });

                var basePath = GetBasePath(contractId);
                if (!Directory.Exists(basePath))
                    return NotFound(new { error = "لا توجد وثائق لهذا العقد" });

                var tempZipPath = Path.Combine(Path.GetTempPath(), $"Contract_{contractId}_{Guid.NewGuid()}.zip");

                try
                {
                    System.IO.Compression.ZipFile.CreateFromDirectory(basePath, tempZipPath);
                    var bytes = System.IO.File.ReadAllBytes(tempZipPath);
                    
                    _logger.LogInformation($"Downloaded contract documents for contract {contractId}");
                    
                    return File(bytes, "application/zip", $"Contract_{contractId}.zip");
                }
                finally
                {
                    if (System.IO.File.Exists(tempZipPath))
                    {
                        try
                        {
                            System.IO.File.Delete(tempZipPath);
                        }
                        catch
                        {
                            _logger.LogWarning($"Failed to clean up temp zip file: {tempZipPath}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in DownloadContractDocuments: {ex.Message}");
                return StatusCode(500, new { error = "فشل في تنزيل الملفات" });
            }
        }

        private string GetMimeType(string filePath)
        {
            var ext = Path.GetExtension(filePath).ToLowerInvariant();
            return ext switch
            {
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".txt" => "text/plain",
                ".zip" => "application/zip",
                _ => "application/octet-stream"
            };
        }
    }
}