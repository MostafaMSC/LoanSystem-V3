using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Loan_System.Migrations
{
    /// <inheritdoc />
    public partial class editRevenueInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BudgetRevenues_RevenueInfo_RevenueId",
                table: "BudgetRevenues");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetRevenues_RevenueInfo_RevenueId",
                table: "BudgetRevenues",
                column: "RevenueId",
                principalTable: "RevenueInfo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BudgetRevenues_RevenueInfo_RevenueId",
                table: "BudgetRevenues");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetRevenues_RevenueInfo_RevenueId",
                table: "BudgetRevenues",
                column: "RevenueId",
                principalTable: "RevenueInfo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
