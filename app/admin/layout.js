import { getServerSession } from 'next-auth/next';
import { authOptions } from '../lib/auth';
import { redirect } from 'next/navigation';
import AdminLayoutClient from './AdminLayoutClient';

export default async function AdminLayout({ children }) {
  // Check authentication server-side
  const session = await getServerSession(authOptions);
  
  // If not authenticated or not admin, redirect to sign in
  if (!session || !session.user.isAdmin) {
    redirect('/auth/signin?callbackUrl=/admin');
  }
  
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}