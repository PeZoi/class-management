import LogsManagementPage from './logs-management-page';
import { createPageMetadata } from '@/lib/metadata';

export const { generateMetadata } = createPageMetadata('Logs Management');

export default function Page() {
  return <LogsManagementPage />;
}


