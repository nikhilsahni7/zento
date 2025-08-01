-- CreateTable
CREATE TABLE "tag_preference" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "tagUrn" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_preference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tag_preference_profileId_tagUrn_key" ON "tag_preference"("profileId", "tagUrn");

-- AddForeignKey
ALTER TABLE "tag_preference" ADD CONSTRAINT "tag_preference_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "taste_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
