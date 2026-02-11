import TeacherManagementPage from '@/app/[locale]/teacher-management/teacher-management-page'
import { RoleGuard } from '@/components/role-guard'
import React from 'react'

export default function Index() {
  return (
    <RoleGuard allowedRoles={['ROLE_ADMIN']}>
      <TeacherManagementPage />
    </RoleGuard>
  )
}
