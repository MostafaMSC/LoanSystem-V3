using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Loan_System.Migrations
{
    /// <inheritdoc />
    public partial class AddPagination : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Budget",
                table: "ContractTable");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "ContractTable");

            migrationBuilder.DropColumn(
                name: "Loan_Type",
                table: "ContractTable");

            migrationBuilder.RenameColumn(
                name: "LoanName",
                table: "ContractTable",
                newName: "Status");

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "ContractTable",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDate",
                table: "ContractTable",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "ContractTable");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "ContractTable");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "ContractTable",
                newName: "LoanName");

            migrationBuilder.AddColumn<decimal>(
                name: "Budget",
                table: "ContractTable",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "ContractTable",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Loan_Type",
                table: "ContractTable",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
