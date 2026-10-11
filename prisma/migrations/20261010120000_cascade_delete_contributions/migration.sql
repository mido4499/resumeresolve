-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_experienceId_fkey";

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;
