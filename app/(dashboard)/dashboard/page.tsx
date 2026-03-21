'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/content');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-purple-600 animate-spin" />
    </div>
  );
}
