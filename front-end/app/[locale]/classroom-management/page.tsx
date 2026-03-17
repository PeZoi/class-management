import ClassroomManagementPage from '@/app/[locale]/classroom-management/classroom-management-page';
import { createPageMetadata } from '@/lib/metadata';

export const { generateMetadata } = createPageMetadata('Class Management');
export const dynamic = 'force-dynamic';

export default function Index() {
  return <ClassroomManagementPage />;
}
