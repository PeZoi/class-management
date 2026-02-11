import StudentDetailPage from '@/app/[locale]/student-management/[id]/student-detail-page';
import { RoleGuard } from '@/components/role-guard';

export default function Index() {
  return (
    <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_TEACHER']}>
      <StudentDetailPage />
    </RoleGuard>
  );
}
