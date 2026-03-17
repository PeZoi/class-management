import StudentManagementPage from '@/app/[locale]/student-management/student-management-page';
import { RoleGuard } from '@/components/role-guard';
import { createPageMetadata } from '@/lib/metadata';
import React from 'react';

export const { generateMetadata } = createPageMetadata('Student Management');
export const dynamic = 'force-dynamic';

export default function Index() {
  return (
    <RoleGuard allowedRoles={['ROLE_ADMIN']}>
      <StudentManagementPage />
    </RoleGuard>
  );
}

