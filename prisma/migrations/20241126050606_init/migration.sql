-- CreateTable
CREATE TABLE "Championship" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "Teams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userName" TEXT NOT NULL,
    "userNum" INTEGER,
    "mmr" INTEGER NOT NULL DEFAULT 0,
    "teamId" INTEGER NOT NULL,
    CONSTRAINT "Teams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Championship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Teams_userName_key" ON "Teams"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "Teams_userNum_key" ON "Teams"("userNum");
