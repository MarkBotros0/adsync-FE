'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { oauthCallbackAPI } from '@/lib/api';
import { AxiosError } from 'axios';

export default function InstagramCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        router.push('/connect?error=' + encodeURIComponent(error));
        return;
      }

      if (!code || !state) {
        router.push('/connect?error=missing_parameters');
        return;
      }

      try {
        const response = await oauthCallbackAPI.instagramCallback(code, state);
        if (response.data.success) {
          router.push('/connect');
        } else {
          router.push('/connect?error=no_session');
        }
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        const detail = axiosError.response?.data?.detail ?? 'auth_failed';
        router.push('/connect?error=' + encodeURIComponent(detail));
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-pink-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Connecting Instagram account...</p>
      </div>
    </div>
  );
}
