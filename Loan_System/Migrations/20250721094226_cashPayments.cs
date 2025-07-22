using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Loan_System.Migrations
{
    /// <inheritdoc />
    public partial class cashPayments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {


            migrationBuilder.CreateTable(
                name: "CashPaidPayments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ContractId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ContractsModuleId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CashPaidPayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CashPaidPayments_ContractTable_ContractsModuleId",
                        column: x => x.ContractsModuleId,
                        principalTable: "ContractTable",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PrivateMoneyPayments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ContractId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ContractsModuleId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrivateMoneyPayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrivateMoneyPayments_ContractTable_ContractsModuleId",
                        column: x => x.ContractsModuleId,
                        principalTable: "ContractTable",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CashPaidPayments_ContractsModuleId",
                table: "CashPaidPayments",
                column: "ContractsModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_PrivateMoneyPayments_ContractsModuleId",
                table: "PrivateMoneyPayments",
                column: "ContractsModuleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CashPaidPayments");

            migrationBuilder.DropTable(
                name: "PrivateMoneyPayments");

            migrationBuilder.AddColumn<decimal>(
                name: "CashPaid",
                table: "ContractTable",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PrivateMoneyPaid",
                table: "ContractTable",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);
        }
    }
}
