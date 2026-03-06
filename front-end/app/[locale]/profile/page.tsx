import ProfilePage from "@/app/[locale]/profile/profile-page";
import { createPageMetadata } from '@/lib/metadata';

export const { generateMetadata } = createPageMetadata('Profile');

export default function Index() {
  return <ProfilePage />;
  
}
