using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Loan_System.Migrations
{
    /// <inheritdoc />
    public partial class LoanInfoedit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoanTable_GateInfos_GateId",
                table: "LoanTable");

            migrationBuilder.DropForeignKey(
                name: "FK_LoanTable_Locations_LocationId",
                table: "LoanTable");

            migrationBuilder.DropTable(
                name: "GateInfos");

            migrationBuilder.DropTable(
                name: "Locations");

            migrationBuilder.DropIndex(
                name: "IX_LoanTable_GateId",
                table: "LoanTable");

            migrationBuilder.DropIndex(
                name: "IX_LoanTable_LocationId",
                table: "LoanTable");

            migrationBuilder.RenameColumn(
                name: "LocationId",
                table: "LoanTable",
                newName: "SerialNo");

            migrationBuilder.RenameColumn(
                name: "GateId",
                table: "LoanTable",
                newName: "ObjectId");

            migrationBuilder.AddColumn<int>(
                name: "ChapterId",
                table: "LoanTable",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DepartmentId",
                table: "LoanTable",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "District",
                table: "LoanTable",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GPS_X",
                table: "LoanTable",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GPS_Y",
                table: "LoanTable",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Gate",
                table: "LoanTable",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GateType",
                table: "LoanTable",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "LoanTable",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Subdistrict",
                table: "LoanTable",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChapterId",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "District",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "GPS_X",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "GPS_Y",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "Gate",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "GateType",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "LoanTable");

            migrationBuilder.DropColumn(
                name: "Subdistrict",
                table: "LoanTable");

            migrationBuilder.RenameColumn(
                name: "SerialNo",
                table: "LoanTable",
                newName: "LocationId");

            migrationBuilder.RenameColumn(
                name: "ObjectId",
                table: "LoanTable",
                newName: "GateId");

            migrationBuilder.CreateTable(
                name: "GateInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChapterId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: true),
                    EnteredUserName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Gate = table.Column<int>(type: "int", nullable: true),
                    GateType = table.Column<int>(type: "int", nullable: true),
                    ObjectId = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    District = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EnteredUserName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GPS_X = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GPS_Y = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Subdistrict = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Locations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LoanTable_GateId",
                table: "LoanTable",
                column: "GateId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanTable_LocationId",
                table: "LoanTable",
                column: "LocationId");

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
    }
}
