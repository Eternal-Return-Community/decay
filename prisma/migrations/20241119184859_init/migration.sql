/*
  Warnings:

  - The primary key for the `Teams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `Teams` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Teams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userName" TEXT NOT NULL,
    "userNum" INTEGER NOT NULL,
    "mmr" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    CONSTRAINT "Teams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Championship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Teams" ("mmr", "teamId", "userName", "userNum") SELECT "mmr", "teamId", "userName", "userNum" FROM "Teams";
DROP TABLE "Teams";
ALTER TABLE "new_Teams" RENAME TO "Teams";
CREATE UNIQUE INDEX "Teams_userName_key" ON "Teams"("userName");
CREATE UNIQUE INDEX "Teams_userNum_key" ON "Teams"("userNum");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
