using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Loan_System.Migrations
{
    /// <inheritdoc />
    public partial class editRevenueInfoModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RevenueSymbol",
                table: "RevenueInfo");

            migrationBuilder.AddColumn<string>(
                name: "Chapter",
                table: "RevenueInfo",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Material",
                table: "RevenueInfo",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Section",
                table: "RevenueInfo",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "RevenueInfo",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TypeDetails",
                table: "RevenueInfo",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Chapter",
                table: "RevenueInfo");

            migrationBuilder.DropColumn(
                name: "Material",
                table: "RevenueInfo");

            migrationBuilder.DropColumn(
                name: "Section",
                table: "RevenueInfo");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "RevenueInfo");

            migrationBuilder.DropColumn(
                name: "TypeDetails",
                table: "RevenueInfo");

            migrationBuilder.AddColumn<string>(
                name: "RevenueSymbol",
                table: "RevenueInfo",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);
        }
    }
}
