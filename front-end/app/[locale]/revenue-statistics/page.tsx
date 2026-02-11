import RevenueStatisticsPage from './revenue-statistics-page';
import { RoleGuard } from '@/components/role-guard';

export default function Index() {
  return (
    <RoleGuard allowedRoles={['ROLE_ADMIN']}>
      <RevenueStatisticsPage />
    </RoleGuard>
  );
}

