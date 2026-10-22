import GenerateForm from "@/app/components/GenerateForm";
import { auth } from "@/auth";
import { getDiaryExport } from "@/lib/diaryExport";
import { isEducationComplete } from "@/lib/education";
import { templates } from "@/lib/templates";
import { GENERATIONS_PER_DAY, limits, peek, waitTime } from "@/lib/rateLimit";
import { redirect } from "next/navigation";

export default async function GeneratePage(){
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/');
    }

    // Also used for the "Prefer your own template?" prompt
    const [diary, usage] = await Promise.all([
        getDiaryExport(session.user.id),
        peek(limits.generationsPerUser(session.user.id)),
    ]);
    if (!diary) {
        redirect('/');
    }

    return (
        <GenerateForm
            templates={Object.values(templates).map(({ id, name }) => ({ id, name }))}
            diary={diary}
            hasEducation={diary.education.some(isEducationComplete)}
            dailyLimit={GENERATIONS_PER_DAY}
            initialLeft={Math.max(0, GENERATIONS_PER_DAY - usage.count)}
            resetsIn={usage.count > 0 ? waitTime(usage.resetAt) : undefined}
        />
    )
}
