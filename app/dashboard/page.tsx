import { redirect } from 'next/navigation';
import { auth } from '@/auth';
export default async function DashboardPage(){
    const session = await auth();

    if (!session || !session?.user) {
        redirect('/')
    }else{
        redirect('/dashboard/experiences');
    }
}