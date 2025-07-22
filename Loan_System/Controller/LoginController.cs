    using Microsoft.AspNetCore.Mvc;
    using System.IdentityModel.Tokens.Jwt;
    using Microsoft.IdentityModel.Tokens;
    using System.Text;
    using System.Security.Claims;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Loan_System.Modules.DTO;
    using Loan_System.Modules;

    using Microsoft.EntityFrameworkCore;
using Loan_System.Data;

namespace Loan_System.Controller
    {
        [ApiController]
        [Route("[controller]")]
        public class AuthController : ControllerBase
        {
            private readonly UserManager<ApplicationUser> _userManager;
            private readonly SignInManager<ApplicationUser> _signInManager;
            private readonly IConfiguration _config; 
            private readonly ApplicationDbContext _context;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AuthController(UserManager<ApplicationUser> userManager,
                            SignInManager<ApplicationUser> signInManager,
                            RoleManager<IdentityRole> roleManager,
                            IConfiguration config,
                            ApplicationDbContext context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _config = config;
            _context = context; 

        
    }

[HttpPost("Register")]
public async Task<IActionResult> Register([FromBody] RegisterDTO model)
{
    // Check if user already exists
    var existingUser = await _userManager.FindByNameAsync(model.Username);
    if (existingUser != null)
        return BadRequest("المستخدم موجود بالفعل");

    // Validate department exists
    var department = await _context.DepartmentTable.FindAsync(model.DepartmentId);
    if (department == null)
        return BadRequest("القسم المحدد غير موجود");

    // Create new user
    var user = new ApplicationUser
    {
        UserName = model.Username,
        DepartmentId = model.DepartmentId // Set the department
    };

    var result = await _userManager.CreateAsync(user, model.Password);
    
    if (!result.Succeeded)
    {
        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
        return BadRequest($"فشل في إنشاء المستخدم: {errors}");
    }

    // Add default role if needed
    await _userManager.AddToRoleAsync(user, "User");

    return Ok(new { message = "تم إنشاء المستخدم بنجاح" });
}

[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] RegisterDTO model)
{
    // 1. Validate user credentials
    var user = await _userManager.FindByNameAsync(model.Username);
    if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
        return Unauthorized("اسم المستخدم أو كلمة المرور غير صحيحة");

    // 2. Get user roles
    var userRoles = await _userManager.GetRolesAsync(user);

    // 3. Get user's department information
    var department = await _context.DepartmentTable
        .Where(d => d.Id == user.DepartmentId) // Assuming user has DepartmentId property
        .Select(d => new { d.Id, d.DepartmentName })
        .FirstOrDefaultAsync();

    // 4. Create claims for the JWT
    var authClaims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id),
        new Claim(ClaimTypes.Name, user.UserName),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };

    // Add department claim if exists
    if (department != null)
    {
        authClaims.Add(new Claim("DepartmentId", department.Id.ToString()));
        authClaims.Add(new Claim("DepartmentName", department.DepartmentName));
    }

    foreach (var role in userRoles)
        authClaims.Add(new Claim(ClaimTypes.Role, role));

    // 5. Generate Access Token
    var jwtKey = _config["Jwt:jwtKey"];
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!));
    var accessToken = new JwtSecurityToken(
        issuer: _config["Jwt:issuer"],
        audience: _config["Jwt:issuer"],
        expires: DateTime.UtcNow.AddMinutes(1), // SHORT expiry
        claims: authClaims,
        signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature)
    );

    var accessTokenString = new JwtSecurityTokenHandler().WriteToken(accessToken);

    // 6. Generate Refresh Token
    var refreshToken = new RefreshToken
    {
        Token = Guid.NewGuid().ToString(),
        UserId = user.Id,
        ExpiryDate = DateTime.UtcNow.AddDays(7)
    };

    // Optional: Remove old tokens (for security)
    var oldTokens = _context.RefreshTokens.Where(r => r.UserId == user.Id);
    _context.RefreshTokens.RemoveRange(oldTokens);

    _context.RefreshTokens.Add(refreshToken);
    await _context.SaveChangesAsync();
    Response.Cookies.Append("refreshToken", refreshToken.Token, new CookieOptions
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Expires = refreshToken.ExpiryDate
    });
    // 7. Return response with department info
    return Ok(new
    {
        UserName = user.UserName,
        accessToken = accessTokenString,
        roles = userRoles,
        department // Include department information
    });
}

    // [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok("User logged out");
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(userId == null)     
            return Unauthorized("User is not authenticated.");

        var user = await _userManager.FindByIdAsync(userId);

        if (user == null) return NotFound();

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            user.UserName,
            Roles = roles
        });
    }
        [Authorize]
[HttpPost("validate-current-password")]
public async Task<IActionResult> ValidateCurrentPassword([FromBody] ValidatePasswordDto dto)
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    var user = await _userManager.FindByIdAsync(userId);
    
    if (user == null) return NotFound();
    
    var isValid = await _userManager.CheckPasswordAsync(user, dto.Password);
    return Ok(new { isValid });
}

[Authorize]
[HttpPost("change-password")]
public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    var user = await _userManager.FindByIdAsync(userId);

    if (user == null) return NotFound();

    // Additional validation
    if (dto.CurrentPassword == dto.NewPassword)
    {
        return BadRequest(new { 
            success = false, 
            message = "New password must be different from current password" 
        });
    }

    var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

    if (!result.Succeeded)
    {
        return BadRequest(new {
            success = false,
            message = "Password change failed",
            errors = result.Errors.Select(e => e.Description)
        });
    }

    // Optional: Invalidate existing sessions if needed
    await _userManager.UpdateSecurityStampAsync(user);

    return Ok(new { 
        success = true, 
        message = "Password updated successfully" 
    });
}

[Authorize(Roles = "Admin")]
[HttpPost("assign-role")]
public async Task<IActionResult> AssignRole([FromBody] AssignRoleModel model)
{
    if (model == null || string.IsNullOrWhiteSpace(model.Username) || string.IsNullOrWhiteSpace(model.Role))
        return BadRequest("Invalid request data.");

    var user = await _userManager.FindByNameAsync(model.Username);
    if (user == null)
        return NotFound($"User '{model.Username}' not found.");

    var roleExists = await _roleManager.RoleExistsAsync(model.Role);
    if (!roleExists)
        return BadRequest($"Role '{model.Role}' does not exist.");

    // Get current roles
    var currentRoles = await _userManager.GetRolesAsync(user);

    if (currentRoles.Any())
    {
        var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
        if (!removeResult.Succeeded)
        {
            var errorMessages = string.Join(", ", removeResult.Errors.Select(e => e.Description));
            return BadRequest($"Failed to remove current roles: {errorMessages}");
        }
    }

    var addResult = await _userManager.AddToRoleAsync(user, model.Role);
    if (!addResult.Succeeded)
    {
        var errorMessages = string.Join(", ", addResult.Errors.Select(e => e.Description));
        return BadRequest($"Failed to assign new role: {errorMessages}");
    }

    return Ok(new
    {
        message = $"User '{model.Username}' has been assigned to role '{model.Role}' successfully."
    });
}


        [Authorize(Roles = "Admin")]
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = _userManager.Users.OfType<ApplicationUser>().ToList();

            var result = new List<object>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
result.Add(new
{
    Id = user.Id,
    UserName = user.UserName,
    Email = user.Email,
    DepartmentId = user.DepartmentId,
    Role = roles.FirstOrDefault() ?? "User",
    Status = user.LockoutEnd == null || user.LockoutEnd <= DateTimeOffset.Now
});

            }

            return Ok(result);
        }



[Authorize(Roles = "Admin")]
[HttpPost("deactivate-user")]
public async Task<IActionResult> DeactivateUser([FromBody] UserStatusRequest request)
{
    if (string.IsNullOrEmpty(request.UserId))
        return BadRequest("UserId is required");

    var user = await _userManager.FindByIdAsync(request.UserId);
    if (user == null) 
        return NotFound("User not found");

    // Check if user is already deactivated
    if (user.LockoutEnd.HasValue && user.LockoutEnd > DateTimeOffset.UtcNow)
        return BadRequest("User is already deactivated");

    user.LockoutEnabled = true;
    user.LockoutEnd = DateTimeOffset.MaxValue;

    var result = await _userManager.UpdateAsync(user);
    if (!result.Succeeded)
        return BadRequest("Failed to deactivate user");

    return Ok(new { message = "User deactivated successfully", userId = request.UserId });
}

[Authorize(Roles = "Admin")]
[HttpPost("activate-user")]
public async Task<IActionResult> ActivateUser([FromBody] UserStatusRequest request)
{
    if (string.IsNullOrEmpty(request.UserId))
        return BadRequest("UserId is required");

    var user = await _userManager.FindByIdAsync(request.UserId);
    if (user == null)
        return NotFound("User not found");

    // Check if user is already active
    if (!user.LockoutEnd.HasValue || user.LockoutEnd <= DateTimeOffset.UtcNow)
        return BadRequest("User is already active");

    user.LockoutEnd = null;
    user.LockoutEnabled = false; // Optional: disable lockout entirely

    var result = await _userManager.UpdateAsync(user);
    if (!result.Succeeded)
        return BadRequest("Failed to activate user");

    return Ok(new { message = "User activated successfully", userId = request.UserId });
}

// Add this DTO class
public class UserStatusRequest
{
    public string UserId { get; set; }
}
[HttpPost("refresh")]
public async Task<IActionResult> Refresh()
{
    var RefreshToken = Request.Cookies["refreshToken"];
    if (string.IsNullOrEmpty(RefreshToken))
        return Unauthorized("Refresh token missing");


    var storedRefreshToken = await _context.RefreshTokens
        .FirstOrDefaultAsync(t => t.Token == RefreshToken);


    if (storedRefreshToken == null || storedRefreshToken.ExpiryDate <= DateTime.UtcNow)
            {
                return Unauthorized("Invalid or expired refresh token");
            }

    var user = await _userManager.FindByIdAsync(storedRefreshToken.UserId);
    if (user == null)
    {
        return Unauthorized("User not found");
    }

    // Generate new access token and refresh token
    var userRoles = await _userManager.GetRolesAsync(user);
    var authClaims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id),
        new Claim(ClaimTypes.Name, user.UserName),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };

    foreach (var role in userRoles)
        authClaims.Add(new Claim(ClaimTypes.Role, role));

    var jwtKey = _config["Jwt:jwtKey"];
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!));
    var newAccessToken = new JwtSecurityToken(
        issuer: _config["Jwt:issuer"],
        audience: _config["Jwt:issuer"],
        expires: DateTime.UtcNow.AddMinutes(45), // New access token expiry
        claims: authClaims,
        signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature)
    );

    var accessTokenString = new JwtSecurityTokenHandler().WriteToken(newAccessToken);

    // Create new refresh token
    var newRefreshToken = new RefreshToken
    {
        Token = Guid.NewGuid().ToString(),
        UserId = user.Id,
        ExpiryDate = DateTime.UtcNow.AddDays(7)
    };

    // Remove old refresh tokens
    var oldTokens = _context.RefreshTokens.Where(t => t.UserId == user.Id);
    _context.RefreshTokens.RemoveRange(oldTokens);
    _context.RefreshTokens.Add(newRefreshToken);

    await _context.SaveChangesAsync();

    Response.Cookies.Append("refreshToken", newRefreshToken.Token, new CookieOptions
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Expires = newRefreshToken.ExpiryDate
    });
    return Ok(new { accessToken = accessTokenString });

}

        [HttpGet("GetAllRoles")]
        public IActionResult GetUAllRoles()
        {
            var roles = _roleManager.Roles.ToList();
            return Ok(roles);
        }
// Add these new endpoints to your existing AuthController class

[Authorize(Roles = "Admin")]
[HttpDelete("delete-user/{userId}")]
public async Task<IActionResult> DeleteUser(string userId)
{
    try
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound("المستخدم غير موجود");

        // Check if user has any related data that needs to be handled
        // You might want to add checks for loans, contracts, etc.
        
        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest($"فشل في حذف المستخدم: {errors}");
        }

        // Also remove any refresh tokens for this user
        var refreshTokens = _context.RefreshTokens.Where(t => t.UserId == userId);
        _context.RefreshTokens.RemoveRange(refreshTokens);
        await _context.SaveChangesAsync();

        return Ok(new { message = "تم حذف المستخدم بنجاح" });
    }
    catch (Exception ex)
    {
        return BadRequest($"خطأ في حذف المستخدم: {ex.Message}");
    }
}

[Authorize(Roles = "Admin")]
[HttpPut("update-user/{userId}")]
public async Task<IActionResult> UpdateUser(string userId, [FromBody] UpdateUserDTO model)
{
    try
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound("المستخدم غير موجود");

        // Update username if provided and different
        if (!string.IsNullOrWhiteSpace(model.Username) && model.Username != user.UserName)
        {
            // Check if new username already exists
            var existingUser = await _userManager.FindByNameAsync(model.Username);
            if (existingUser != null && existingUser.Id != userId)
                return BadRequest("اسم المستخدم موجود بالفعل");

            user.UserName = model.Username;
        }

        // Update email if provided
        if (!string.IsNullOrWhiteSpace(model.Email))
        {
            user.Email = model.Email;
            user.EmailConfirmed = false; // Reset email confirmation if email changed
        }

        // Update department if provided
        if (model.DepartmentId.HasValue)
        {
            var departmentName = await _context.DepartmentTable.FindAsync(model.DepartmentId.Value);
            if (departmentName == null)
                return BadRequest("القسم المحدد غير موجود");

            user.DepartmentId = model.DepartmentId.Value;
        }

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest($"فشل في تحديث المستخدم: {errors}");
        }

        // Update role if provided
        if (!string.IsNullOrWhiteSpace(model.Role))
        {
            var roleExists = await _roleManager.RoleExistsAsync(model.Role);
            if (!roleExists)
                return BadRequest($"الدور '{model.Role}' غير موجود");

            var currentRoles = await _userManager.GetRolesAsync(user);
            if (currentRoles.Any())
            {
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
            }
            await _userManager.AddToRoleAsync(user, model.Role);
        }

        // Get updated user info to return
        var updatedRoles = await _userManager.GetRolesAsync(user);
        var department = await _context.DepartmentTable
            .Where(d => d.Id == user.DepartmentId)
            .Select(d => new { d.Id, d.DepartmentName })
            .FirstOrDefaultAsync();

        return Ok(new
        {
            message = "تم تحديث المستخدم بنجاح",
            user = new
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                DepartmentId = user.DepartmentId,
                Role = updatedRoles.FirstOrDefault() ?? "User",
                Status = user.LockoutEnd == null || user.LockoutEnd <= DateTimeOffset.Now,
                Department = department
            }
        });
    }
    catch (Exception ex)
    {
        return BadRequest($"خطأ في تحديث المستخدم: {ex.Message}");
    }
}

        [Authorize(Roles = "Admin")]
        [HttpPut("update-user-department/{userId}")]
        public async Task<IActionResult> UpdateUserDepartment(string userId, [FromBody] UpdateDepartmentDTO model)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return NotFound("المستخدم غير موجود");

                // Validate department exists
                var department = await _context.DepartmentTable.FindAsync(model.DepartmentId);
                if (department == null)
                    return BadRequest("القسم المحدد غير موجود");

                user.DepartmentId = model.DepartmentId;
                var result = await _userManager.UpdateAsync(user);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    return BadRequest($"فشل في تحديث قسم المستخدم: {errors}");
                }

                return Ok(new { message = "تم تحديث قسم المستخدم بنجاح" });
            }
            catch (Exception ex)
            {
                return BadRequest($"خطأ في تحديث قسم المستخدم: {ex.Message}");
            }
        }
// [Authorize(Roles = "Admin")]
[HttpPost("reset-user-password")]
public async Task<IActionResult> ResetUserPassword([FromBody] ResetPasswordRequest request)
{
    try
    {
        if (string.IsNullOrEmpty(request.UserId))
            return BadRequest("UserId is required");

        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null)
            return NotFound("User not found");

        // Generate a new random password
        string newPassword = GenerateRandomPassword();
        
        // Remove current password
        var removeResult = await _userManager.RemovePasswordAsync(user);
        if (!removeResult.Succeeded)
            return BadRequest("Failed to remove current password");

        // Add new password
        var addResult = await _userManager.AddPasswordAsync(user, newPassword);
        if (!addResult.Succeeded)
            return BadRequest("Failed to set new password");

        // Return the new password in the response
        return Ok(new { 
            success = true,
            newPassword = newPassword,
            message = "Password reset successfully"
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { 
            success = false,
            message = "Internal server error",
            error = ex.Message 
        });
    }
}

private string GenerateRandomPassword()
{
    const string chars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@$?_-";
    var random = new Random();
    return new string(Enumerable.Repeat(chars, 10)
        .Select(s => s[random.Next(s.Length)]).ToArray());
}
    }
    
    }
