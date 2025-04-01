'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import QuestionManagement from '@/components/admin/QuestionManagement';

export default function AdminQuestionsPage() {
  return (
    <AdminLayout>
      <QuestionManagement />
    </AdminLayout>
  );
} 