import StudentManagementPage from '@/app/[locale]/student-management/student-management-page';
import { RoleGuard } from '@/components/role-guard';
import React from 'react';

export default function Index() {
  return (
    <RoleGuard allowedRoles={['ROLE_ADMIN']}>
      <StudentManagementPage />
    </RoleGuard>
  );
}

