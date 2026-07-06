using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpendWise.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountIsDefault : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Accounts_UserId",
                table: "Accounts");

            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                table: "Accounts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_UserId_IsDefault",
                table: "Accounts",
                columns: new[] { "UserId", "IsDefault" });

            migrationBuilder.Sql("""
                WITH RankedAccounts AS (
                    SELECT Id, ROW_NUMBER() OVER (PARTITION BY UserId ORDER BY CreatedAt) AS RowNum
                    FROM Accounts
                    WHERE IsActive = 1
                )
                UPDATE Accounts
                SET IsDefault = 1
                WHERE Id IN (SELECT Id FROM RankedAccounts WHERE RowNum = 1)
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Accounts_UserId_IsDefault",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "IsDefault",
                table: "Accounts");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_UserId",
                table: "Accounts",
                column: "UserId");
        }
    }
}
