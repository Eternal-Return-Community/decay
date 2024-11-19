/*
  Warnings:

  - A unique constraint covering the columns `[userName]` on the table `Teams` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userNum]` on the table `Teams` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Teams_userName_key" ON "Teams"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "Teams_userNum_key" ON "Teams"("userNum");
