import NotificationsPage from './notifications-page';
import { createPageMetadata } from '@/lib/metadata';

export const { generateMetadata } = createPageMetadata('Notifications');

export default function Page() {
  return <NotificationsPage />;
}

