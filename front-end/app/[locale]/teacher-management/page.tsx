import TeacherManagementPage from '@/app/[locale]/teacher-management/teacher-management-page'
import { RoleGuard } from '@/components/role-guard'
import { createPageMetadata } from '@/lib/metadata'
import React from 'react'

export const { generateMetadata } = createPageMetadata('Teacher Management');
export const dynamic = 'force-dynamic';

export default function Index() {
  return (
    <RoleGuard allowedRoles={['ROLE_ADMIN']}>
      <TeacherManagementPage />
    </RoleGuard>
  )
}
