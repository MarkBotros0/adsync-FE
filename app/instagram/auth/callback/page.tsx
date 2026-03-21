'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function InstagramCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        console.error('Instagram auth error:', error);
        router.push('/connect?error=' + encodeURIComponent(error));
        return;
      }

      if (!code || !state) {
        console.error('Missing code or state parameter');
        router.push('/connect?error=missing_parameters');
        return;
      }

      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(
          `${backendUrl}/instagram/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
          console.error('Backend error:', errorData);
          router.push('/connect?error=' + encodeURIComponent(errorData.detail || 'auth_failed'));
          return;
        }

        const data = await response.json();

        if (data.success) {
          router.push('/connect?connected=instagram');
        } else {
          router.push('/connect?error=no_session');
        }
      } catch (err) {
        console.error('Error during Instagram callback:', err);
        router.push('/connect?error=callback_failed');
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
