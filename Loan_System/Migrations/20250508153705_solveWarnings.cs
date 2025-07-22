using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Loan_System.Migrations
{
    /// <inheritdoc />
    public partial class solveWarnings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "EndDate",
                table: "ContractTable",
                newName: "Contract_signing_date");

            migrationBuilder.AddColumn<int>(
                name: "AddedDays",
                table: "ContractTable",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompleteDate",
                table: "ContractTable",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ContractName",
                table: "ContractTable",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContractNumber",
                table: "ContractTable",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Contract_Amount",
                table: "ContractTable",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "DurationInDays",
                table: "ContractTable",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AddedDays",
                table: "ContractTable");

            migrationBuilder.DropColumn(
                name: "CompleteDate",
                table: "ContractTable");

            migrationBuilder.DropColumn(
                name: "ContractName",
                table: "ContractTable");

            migrationBuilder.DropColumn(
                name: "ContractNumber",
                table: "ContractTable");

            migrationBuilder.DropColumn(
                name: "Contract_Amount",
                table: "ContractTable");

            migrationBuilder.DropColumn(
                name: "DurationInDays",
                table: "ContractTable");

            migrationBuilder.RenameColumn(
                name: "Contract_signing_date",
                table: "ContractTable",
                newName: "EndDate");
        }
    }
}
