'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function FacebookCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        console.error('Facebook auth error:', error);
        router.push('/?error=' + encodeURIComponent(error));
        return;
      }

      if (!code || !state) {
        console.error('Missing code or state parameter');
        router.push('/?error=missing_parameters');
        return;
      }

      try {
        // Forward the callback to your backend
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(
          `${backendUrl}/facebook/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
          console.error('Backend error:', errorData);
          router.push('/?error=' + encodeURIComponent(errorData.detail || 'auth_failed'));
          return;
        }

        const data = await response.json();
        
        if (data.success && data.session_id) {
          // Store session_id and redirect to Facebook dashboard
          sessionStorage.setItem('session_id', data.session_id);
          router.push(`/facebook?session_id=${data.session_id}`);
        } else {
          router.push('/?error=no_session');
        }
      } catch (err) {
        console.error('Error during callback:', err);
        router.push('/?error=callback_failed');
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
