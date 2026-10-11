-- Outstanding links are dropped (users can request a new one) so the new required column can be added
DELETE FROM "VerificationToken";

-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "email" TEXT NOT NULL;

