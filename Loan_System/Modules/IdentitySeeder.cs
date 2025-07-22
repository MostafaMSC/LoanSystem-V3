// IdentitySeeder.cs
using Loan_System.Modules;
using Microsoft.AspNetCore.Identity;
public static class IdentitySeeder
{
    public static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
    {
        string[] roleNames = { "Admin", "User" , "ArchiveUser","LoanUser"};

        foreach (var roleName in roleNames)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                var result = await roleManager.CreateAsync(new IdentityRole(roleName));
                Console.WriteLine(result.Succeeded
                    ? $"✅ Role '{roleName}' created."
                    : $"❌ Failed to create role '{roleName}'.");
            }
        }
    }

    public static async Task SeedAdminAsync(UserManager<ApplicationUser> userManager)
{
    var adminUser = await userManager.FindByNameAsync("admin");

    if (adminUser == null)
    {
        var user = new ApplicationUser
        {
            UserName = "admin",
            Email = "admin@example.com",
            EmailConfirmed = true,
            DepartmentId = 1 // Or the ID of your Admin department
        };

        var result = await userManager.CreateAsync(user, "Admin@123");

        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(user, "Admin");
            Console.WriteLine("✅ Admin user created and assigned to 'Admin' role.");
        }
        else
        {
            Console.WriteLine("❌ Failed to create admin user:");
            foreach (var error in result.Errors)
                Console.WriteLine($"- {error.Description}");
        }
    }
    else
    {
        Console.WriteLine("ℹ️ Admin user already exists.");
    }
}

}
