'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EchofoldSpinner } from '@/components/brand/echofold-spinner';

export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/content');
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <EchofoldSpinner size="md" label="Loading your feed" />
    </div>
  );
}
