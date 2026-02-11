import DashboardPage from '@/app/[locale]/dashboard/dashboard-page';
import { RoleGuard } from '@/components/role-guard';

export default function index() {
  return (
    <RoleGuard allowedRoles={['ROLE_ADMIN']}>
      <DashboardPage />
    </RoleGuard>
  );
}
