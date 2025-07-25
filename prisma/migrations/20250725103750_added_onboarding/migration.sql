-- CreateTable
CREATE TABLE "taste_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "affinityTags" TEXT[],
    "homeCity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taste_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "taste_profile_userId_key" ON "taste_profile"("userId");

-- AddForeignKey
ALTER TABLE "taste_profile" ADD CONSTRAINT "taste_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
