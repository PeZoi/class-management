import PaymentManagementPage from '@/app/[locale]/payment-management/payment-management';
import { RoleGuard } from '@/components/role-guard';

export default function Index() {
  return (
    <RoleGuard allowedRoles={['ROLE_ADMIN']}>
      <PaymentManagementPage />
    </RoleGuard>
  );
}
