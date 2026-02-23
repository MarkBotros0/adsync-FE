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
          
          <div className="flex gap-6 justify-center flex-wrap">
            <Button 
              onClick={handleLogin} 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-lg px-12 py-7 rounded-xl shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300 font-bold cursor-pointer"
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white/40 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/60 text-lg px-12 py-7 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold cursor-pointer"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
