-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Teams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userName" TEXT NOT NULL,
    "userNum" INTEGER NOT NULL,
    "mmr" INTEGER NOT NULL DEFAULT 0,
    "teamId" INTEGER NOT NULL,
    CONSTRAINT "Teams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Championship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Teams" ("id", "mmr", "teamId", "userName", "userNum") SELECT "id", "mmr", "teamId", "userName", "userNum" FROM "Teams";
DROP TABLE "Teams";
ALTER TABLE "new_Teams" RENAME TO "Teams";
CREATE UNIQUE INDEX "Teams_userName_key" ON "Teams"("userName");
CREATE UNIQUE INDEX "Teams_userNum_key" ON "Teams"("userNum");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
