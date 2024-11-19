/*
  Warnings:

  - The primary key for the `Teams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Teams` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Teams" (
    "teamId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userName" TEXT NOT NULL,
    "userNum" INTEGER NOT NULL,
    "mmr" INTEGER NOT NULL,
    CONSTRAINT "Teams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Championship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Teams" ("mmr", "teamId", "userName", "userNum") SELECT "mmr", "teamId", "userName", "userNum" FROM "Teams";
DROP TABLE "Teams";
ALTER TABLE "new_Teams" RENAME TO "Teams";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
