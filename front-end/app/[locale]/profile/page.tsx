import ProfilePage from "@/app/[locale]/profile/profile-page";
import { createPageMetadata } from '@/lib/metadata';

export const { generateMetadata } = createPageMetadata('Profile');
export const dynamic = 'force-dynamic';

export default function Index() {
  return <ProfilePage />;
}
