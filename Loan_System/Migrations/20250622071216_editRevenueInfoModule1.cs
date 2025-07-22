using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Loan_System.Migrations
{
    /// <inheritdoc />
    public partial class editRevenueInfoModule1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BudgetRevenues_Departments_DepartmentId",
                table: "BudgetRevenues");

            migrationBuilder.DropIndex(
                name: "IX_BudgetRevenue_DepartmentId",
                table: "BudgetRevenues");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "BudgetRevenues");

            migrationBuilder.AddColumn<string>(
                name: "Department",
                table: "BudgetRevenues",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "DepartmentModuleId",
                table: "BudgetRevenues",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BudgetRevenues_DepartmentModuleId",
                table: "BudgetRevenues",
                column: "DepartmentModuleId");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetRevenues_Departments_DepartmentModuleId",
                table: "BudgetRevenues",
                column: "DepartmentModuleId",
                principalTable: "Departments",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BudgetRevenues_Departments_DepartmentModuleId",
                table: "BudgetRevenues");

            migrationBuilder.DropIndex(
                name: "IX_BudgetRevenues_DepartmentModuleId",
                table: "BudgetRevenues");

            migrationBuilder.DropColumn(
                name: "Department",
                table: "BudgetRevenues");

            migrationBuilder.DropColumn(
                name: "DepartmentModuleId",
                table: "BudgetRevenues");

            migrationBuilder.AddColumn<int>(
                name: "DepartmentId",
                table: "BudgetRevenues",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_BudgetRevenue_DepartmentId",
                table: "BudgetRevenues",
                column: "DepartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetRevenues_Departments_DepartmentId",
                table: "BudgetRevenues",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
