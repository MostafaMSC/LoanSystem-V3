using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Loan_System.Migrations
{
    /// <inheritdoc />
    public partial class LoanInfoAdd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ActualAnnualId",
                table: "LoanTable",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ActualFinishYear",
                table: "LoanTable",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BenfitDep",
                table: "LoanTable",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ChangedBudget",
                table: "LoanTable",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "CustomizeAnnualId",
                table: "LoanTable",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "FinalTotalBudget",
                table: "LoanTable",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "GateId",
                table: "LoanTable",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "InvestType",
                table: "LoanTable",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LocationId",
                table: "LoanTable",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NoYearTOComplete",
                table: "LoanTable",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProjectDescription",
                table: "LoanTable",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProjectTarget",
                table: "LoanTable",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProjectType",
                table: "LoanTable",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PutYear",
                table: "LoanTable",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ActualExpenseannual",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Year = table.Column<int>(type: "int", nullable: false),
                    Cost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EnteredUserName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActualExpenseannual", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Customizeannual",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Year = table.Column<int>(type: "int", nullable: false),
                    Cost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EnteredUserName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customizeannual", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GateInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Gate = table.Column<int>(type: "int", nullable: true),
                    DepartmentId = table.Column<int>(type: "int", nullable: true),
                    ChapterId = table.Column<int>(type: "int", nullable: true),
                    ObjectId = table.Column<int>(type: "int", nullable: true),
                    GateType = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EnteredUserName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GateInfos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Locations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    District = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Subdistrict = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GPS_X = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GPS_Y = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EnteredUserName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Locations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LoanTable_ActualAnnualId",
                table: "LoanTable",
                column: "ActualAnnualId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanTable_CustomizeAnnualId",
                table: "LoanTable",
                column: "CustomizeAnnualId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanTable_GateId",
                table: "LoanTable",
                column: "GateId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanTable_LocationId",
                table: "LoanTable",
                column: "LocationId");

            migrationBuilder.AddForeignKey(
                name: "FK_LoanTable_ActualExpenseannual_ActualAnnualId",
                table: "LoanTable",
                column: "ActualAnnualId",
                principalTable: "ActualExpenseannual",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LoanTable_Customizeannual_CustomizeAnnualId",
                table: "LoanTable",
                column: "CustomizeAnnualId",
                principalTable: "Customizeannual",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LoanTable_GateInfos_GateId",
                table: "LoanTable",
                column: "GateId",
                principalTable: "GateInfos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LoanTable_Locations_LocationId",
                table: "LoanTable",
                column: "LocationId",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoanTable_ActualExpenseannual_ActualAnnualId",
                table: "LoanTable");

            migrationBuilder.DropForeignKey(
                name: "FK_LoanTable_Customizeannual_CustomizeAnnualId",
                table: "LoanTable");

            migrationBuilder.DropForeignKey(
                name: "FK_LoanTable_GateInfos_GateId",
                table: "LoanTable");

            migrationBuilder.DropForeignKey(
                name: "FK_LoanTable_Locations_LocationId",
                table: "LoanTable");

            migrationBuilder.DropTable(
                name: "ActualExpenseannual");

            migrationBuilder.DropTable(
                name: "Customizeannual");

            migrationBuilder.DropTable(
                name: "GateInfos");

            migrationBuilder.DropTable(
                name: "Locations");

            migrationBuilder.DropIndex(
                name: "IX_LoanTable_ActualAnnualId",
                table: "LoanTable");

            migrationBuilder.DropIndex(
                name: "IX_LoanTable_CustomizeAnnualId",
                table: "LoanTable");

            migrationBuilder.DropIndex(
                name: "IX_LoanTable_GateId",
                table: "LoanTable");

            migrationBuilder.DropIndex(
                name: "IX_LoanTable_LocationId",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "ActualAnnualId",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "ActualFinishYear",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "BenfitDep",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "ChangedBudget",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "CustomizeAnnualId",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "FinalTotalBudget",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "GateId",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "InvestType",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "LocationId",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "NoYearTOComplete",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "ProjectDescription",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "ProjectTarget",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "ProjectType",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "PutYear",
                table: "LoanTable");
        }
    }
}
