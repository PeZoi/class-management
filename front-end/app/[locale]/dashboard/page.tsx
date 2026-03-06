import DashboardPage from '@/app/[locale]/dashboard/dashboard-page';
import { RoleGuard } from '@/components/role-guard';
import { createPageMetadata } from '@/lib/metadata';

export const { generateMetadata } = createPageMetadata('dashboard');

export default function index() {
  return (
    <RoleGuard allowedRoles={['ROLE_ADMIN']}>
      <DashboardPage />
    </RoleGuard>
  );
}
