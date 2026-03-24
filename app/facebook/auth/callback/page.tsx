'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { oauthCallbackAPI } from '@/lib/api';
import { AxiosError } from 'axios';

export default function FacebookCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        router.push('/login?error=' + encodeURIComponent(error));
        return;
      }

      if (!code || !state) {
        router.push('/login?error=missing_parameters');
        return;
      }

      try {
        const response = await oauthCallbackAPI.facebookCallback(code, state);
        if (response.data.success && response.data.session_id) {
          router.push('/content');
        } else {
          router.push('/login?error=no_session');
        }
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        const detail = axiosError.response?.data?.detail ?? 'auth_failed';
        router.push('/login?error=' + encodeURIComponent(detail));
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Completing authentication...</p>
      </div>
    </div>
  );
}
