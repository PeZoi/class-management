// Root layout chỉ để Next.js không phàn nàn
// Layout thực sự nằm ở app/[locale]/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
