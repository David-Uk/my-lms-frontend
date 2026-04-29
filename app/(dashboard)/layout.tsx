import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - LMS',
  description: 'Learning Management System Dashboard',
};

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
