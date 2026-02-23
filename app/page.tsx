'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { BarChart3 } from 'lucide-react';
import { Toaster, toast } from 'sonner';

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const session = searchParams.get('session_id');
    if (session) {
      sessionStorage.setItem('session_id', session);
      router.push(`/dashboard?session_id=${session}`);
    }
  }, [searchParams, router]);

  const handleLogin = async (): Promise<void> => {
    try {
      const response = await authAPI.login();
      window.location.href = response.data.login_url;
    } catch (err) {
      toast.error('Failed to initiate login');
      console.error('Login failed:', err);
    }
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center max-w-4xl">
          <div className="mb-8">
            <div className="inline-flex p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
              <BarChart3 className="w-24 h-24 text-white" />
            </div>
          </div>
          
          <h1 className="text-7xl font-black mb-6 text-white">
            Analytics <span className="text-blue-400">Pro</span>
          </h1>
          
          <p className="text-2xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Your all-in-one platform for tracking social media performance across Facebook, Instagram & TikTok
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={handleLogin} 
              size="lg" 
              className="bg-white text-slate-900 hover:bg-blue-50 text-lg px-10 py-6"
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white/30 text-white hover:bg-white/10 text-lg px-10 py-6"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
