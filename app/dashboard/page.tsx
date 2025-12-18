import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/admin/admin-dashboard';
import ParticipantDashboard from '@/components/participant/participant-dashboard';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;

  if (userRole === 'admin') {
    return <AdminDashboard />;
  } else {
    return <ParticipantDashboard />;
  }
}
