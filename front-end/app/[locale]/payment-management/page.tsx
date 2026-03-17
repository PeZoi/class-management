import PaymentManagementPage from '@/app/[locale]/payment-management/payment-management-page';
import { RoleGuard } from '@/components/role-guard';
import { createPageMetadata } from '@/lib/metadata';

export const { generateMetadata } = createPageMetadata('Payment Management');
export const dynamic = 'force-dynamic';

export default function Index() {
  return (
    <RoleGuard allowedRoles={['ROLE_ADMIN']}>
      <PaymentManagementPage />
    </RoleGuard>
  );
}
