'use client';

import { useAuthStore } from '@/store/auth-store';
import { Chatbot } from '@/components/chatbot';

export function AdminChatbot() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!user || !accessToken) return null;
  if (user.role !== 'ROLE_ADMIN') return null;

  return <Chatbot />;
}

