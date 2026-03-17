import RevenueStatisticsPage from './revenue-statistics-page';
import { RoleGuard } from '@/components/role-guard';
import { createPageMetadata } from '@/lib/metadata';

export const { generateMetadata } = createPageMetadata('title', 'description', 'revenue-statistics');
export const dynamic = 'force-dynamic';

export default function Index() {
  return (
    <RoleGuard allowedRoles={['ROLE_ADMIN']}>
      <RevenueStatisticsPage />
    </RoleGuard>
  );
}

