using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Loan_System.Modules;
using Microsoft.AspNetCore.Identity;
using System.Reflection.Emit;

namespace Loan_System.Data
{
public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole, string>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options,
        IHttpContextAccessor httpContextAccessor)
            : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        // Existing tables
        public DbSet<ContractsModule> ContractTable { get; set; }
        public DbSet<LoanModule> LoanTable { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        
        // Budget/Revenue tables
        public DbSet<RevenueInfoModule> RevenueInfoTable { get; set; }
        public DbSet<DepartmentModule> DepartmentTable { get; set; }
        public DbSet<BudgetRevenue> BudgetRevenueTable { get; set; } // Added missing DbSet
        public DbSet<ContractDocument> ContractDocuments { get; set; }
        public DbSet<PrivateMoneyPayments> PrivateMoneyPayments { get; set; }

        public DbSet<CashPaidPayments> CashPaidPayments { get; set; }


        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var username = _httpContextAccessor.HttpContext?.User?.Identity?.Name ?? "System";
            Console.WriteLine(username);

            foreach (var entry in ChangeTracker.Entries<Entity>())
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    entry.Entity.EnteredUserName = username;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.MarkUpdated();
                    entry.Entity.EnteredUserName = username; // Update username on modify too
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Call base configuration for Identity
            base.OnModelCreating(modelBuilder);
                
        modelBuilder.Entity<ContractDocument>()
        .HasOne(d => d.Contract)
        .WithMany(c => c.Documents)
        .HasForeignKey(d => d.ContractId)
        .OnDelete(DeleteBehavior.Cascade);
                
            // Configure decimal precision for currency fields
            modelBuilder.Entity<BudgetRevenue>()
                .Property(br => br.RevenueCost)
                .HasPrecision(18, 2);

            // Configure table names (optional - for consistency)
            modelBuilder.Entity<RevenueInfoModule>()
                .ToTable("RevenueInfo");
                
            modelBuilder.Entity<DepartmentModule>()
                .ToTable("Departments");
                
            modelBuilder.Entity<BudgetRevenue>()
                .ToTable("BudgetRevenues");

            // Add indexes for better performance
            modelBuilder.Entity<BudgetRevenue>()
                .HasIndex(br => br.RevenueId)
                .HasDatabaseName("IX_BudgetRevenue_RevenueId");


        }
    }
}