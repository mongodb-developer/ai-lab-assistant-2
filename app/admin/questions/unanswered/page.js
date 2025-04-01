'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import QuestionManagement from '@/components/admin/QuestionManagement';

export default function UnansweredQuestionsPage() {
  return (
    <AdminLayout>
      <QuestionManagement initialFilter={{ answered: false }} />
    </AdminLayout>
  );
} 