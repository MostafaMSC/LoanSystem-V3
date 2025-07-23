using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Loan_System.Migrations
{
    /// <inheritdoc />
    public partial class SplitTaxesAndBlockedmoney : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TaxesAndBlockedmoney",
                table: "ContractTable",
                newName: "InsuranceDeposits");

            migrationBuilder.AddColumn<decimal>(
                name: "OtherTrusts",
                table: "ContractTable",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Penalties",
                table: "ContractTable",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxTrusts",
                table: "ContractTable",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OtherTrusts",
                table: "ContractTable");

            migrationBuilder.DropColumn(
                name: "Penalties",
                table: "ContractTable");

            migrationBuilder.DropColumn(
                name: "TaxTrusts",
                table: "ContractTable");

            migrationBuilder.RenameColumn(
                name: "InsuranceDeposits",
                table: "ContractTable",
                newName: "TaxesAndBlockedmoney");
        }
    }
}
