import TeacherDetailPage from '@/app/[locale]/teacher-management/[id]/teacher-detail-page'
import { RoleGuard } from '@/components/role-guard'

export default function Index() {
  return (
    <RoleGuard allowedRoles={['ROLE_ADMIN']}>
      <TeacherDetailPage />
    </RoleGuard>
  )
}
