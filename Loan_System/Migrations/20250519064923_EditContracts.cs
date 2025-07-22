using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Loan_System.Migrations
{
    /// <inheritdoc />
    public partial class EditContracts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Contract_Amount",
                table: "ContractTable");

            migrationBuilder.RenameColumn(
                name: "TypeSymbol",
                table: "ContractTable",
                newName: "Notes");

            migrationBuilder.RenameColumn(
                name: "Contract_signing_date",
                table: "ContractTable",
                newName: "ContractSigningDate");

            migrationBuilder.AddColumn<decimal>(
                name: "CashPaid",
                table: "ContractTable",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ContractAmount",
                table: "ContractTable",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "CostAfterChange",
                table: "ContractTable",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "CostPlanMins",
                table: "ContractTable",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "CostToNatiBank",
                table: "ContractTable",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "OperationLoanCost",
                table: "ContractTable",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PrivateMoneyPaid",
                table: "ContractTable",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxesAndBlockedmoney",
                table: "ContractTable",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalCostPaid",
                table: "ContractTable",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CashPaid",
                table: "ContractTable");

            migrationBuilder.DropColumn(
                name: "ContractAmount",
                table: "ContractTable");

            migrationBuilder.DropColumn(
                name: "CostAfterChange",
                table: "ContractTable");

            migrationBuilder.DropColumn(
                name: "CostPlanMins",
                table: "ContractTable");

            migrationBuilder.DropColumn(
                name: "CostToNatiBank",
                table: "ContractTable");

            migrationBuilder.DropColumn(
                name: "OperationLoanCost",
                table: "ContractTable");

            migrationBuilder.DropColumn(
                name: "PrivateMoneyPaid",
                table: "ContractTable");

            migrationBuilder.DropColumn(
                name: "TaxesAndBlockedmoney",
                table: "ContractTable");

            migrationBuilder.DropColumn(
                name: "TotalCostPaid",
                table: "ContractTable");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "ContractTable",
                newName: "TypeSymbol");

            migrationBuilder.RenameColumn(
                name: "ContractSigningDate",
                table: "ContractTable",
                newName: "Contract_signing_date");

            migrationBuilder.AddColumn<decimal>(
                name: "Contract_Amount",
                table: "ContractTable",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
