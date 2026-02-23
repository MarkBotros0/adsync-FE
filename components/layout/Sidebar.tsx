'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Share2, 
  Camera, 
  Video,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSidebar } from '@/contexts/sidebar-context';
import { useState } from 'react';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onLogout: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Facebook', href: '/facebook', icon: Share2 },
  { name: 'Instagram', href: '/instagram', icon: Camera },
  { name: 'TikTok', href: '/tiktok', icon: Video },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ isMobileOpen, setIsMobileOpen, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <>
      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 shadow-sm transform transition-all duration-300 ease-in-out lg:translate-x-0 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} 
        w-64`}
      >
        <div className="flex flex-col h-full relative">
          {/* Mobile Close Button */}
          <div className="lg:hidden absolute top-3 right-3 z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileOpen(false);
              }}
              className="h-10 w-10"
            >
              <X className="h-6 w-6 text-slate-600" />
            </Button>
          </div>

          {/* Logo Section */}
          <div className="flex flex-col items-center justify-center pt-12 pb-6 lg:py-6 border-b border-slate-200 gap-3">
            <div className="relative">
              <div className={`bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isCollapsed ? 'lg:w-12 lg:h-12' : 'w-16 h-16'
              } w-16 h-16`}>
                <BarChart3 className={`text-white ${isCollapsed ? 'lg:w-6 lg:h-6' : 'w-8 h-8'} w-8 h-8`} />
              </div>
            </div>
            <div className={`text-center ${isCollapsed ? 'lg:hidden' : 'block'}`}>
              <h1 className="text-lg font-bold px-2">Analytics Pro</h1>
              <p className="text-xs text-slate-600">Social Media Insights</p>
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center text-sm font-medium rounded-lg transition-colors 
                  ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                  ${isCollapsed ? 'lg:justify-center lg:p-2' : 'px-4 py-3'} 
                  px-4 py-3`}
                >
                  <item.icon className={`${isCollapsed ? 'lg:w-7 lg:h-7 lg:mr-0' : 'w-5 h-5 mr-3'} w-5 h-5 mr-3`} />
                  <span className={`${isCollapsed ? 'lg:hidden' : 'block'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop collapse toggle */}
          <div className="hidden lg:flex items-center justify-center border-t border-slate-200 py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
