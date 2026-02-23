'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardContent } from '@/components/layout/dashboard-content';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { authAPI, pagesAPI } from '@/lib/api';
import type { FacebookPage } from '@/lib/types';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const session = searchParams.get('session_id');
    const storedSession = sessionStorage.getItem('session_id');
    
    if (session) {
      sessionStorage.setItem('session_id', session);
      setSessionId(session);
      loadPages(session);
    } else if (storedSession) {
      setSessionId(storedSession);
      loadPages(storedSession);
    }
  }, [searchParams]);

  const loadPages = async (session: string): Promise<void> => {
    try {
      const response = await pagesAPI.getPages(session);
      const pagesData = response.data.pages || [];
      setPages(pagesData);
      
      if (pagesData.length > 0) {
        setSelectedPage(pagesData[0]);
      }
    } catch (err: any) {
      console.error('Failed to load pages:', err);
      
      // If session is invalid, clear it and redirect to login
      if (err.response?.status === 401 || err.response?.status === 400) {
        sessionStorage.removeItem('session_id');
        toast.error('Session expired. Please login again.');
        setTimeout(() => router.push('/'), 1000);
      } else {
        toast.error('Failed to load pages');
      }
    }
  };

  const handleLogout = async (): Promise<void> => {
    if (!sessionId) return;
    
    try {
      await authAPI.logout(sessionId);
      sessionStorage.removeItem('session_id');
      toast.success('Logged out successfully');
      setTimeout(() => router.push('/'), 1000);
    } catch (err) {
      toast.error('Failed to logout');
      console.error('Logout failed:', err);
    }
  };

  const handlePageSelect = useCallback((page: FacebookPage): void => {
    setSelectedPage(page);
    toast.success(`Switched to ${page.name}`);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex h-dvh overflow-hidden bg-slate-50">
        <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} onLogout={handleLogout} />
        <DashboardContent>
          <Header 
            onMenuClick={() => setIsMobileOpen(true)}
            pages={pages}
            selectedPage={selectedPage}
            onPageSelect={handlePageSelect}
            onLogout={handleLogout}
          />
          <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-8">
            {children}
          </main>
        </DashboardContent>
      </div>
    </SidebarProvider>
  );
}
