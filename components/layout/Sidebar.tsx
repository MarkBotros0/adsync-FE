'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  BarChart2,
  Sparkles,
  Users,
  Globe,
  Settings,
  FileText,
  Bell,
  UserCheck,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plug,
} from 'lucide-react';
import { useState } from 'react';
import type { FacebookPage } from '@/lib/types';
import { useSidebar } from '@/contexts/sidebar-context';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onLogout: () => void;
  pages?: FacebookPage[];
  selectedPage?: FacebookPage | null;
  onPageSelect?: (page: FacebookPage) => void;
}

const primaryNav = [
  { name: 'Content',      href: '/content',      icon: MessageSquare },
  { name: 'Analytics',   href: '/analytics',    icon: BarChart2     },
  { name: 'AI Digest',   href: '/ai-digest',    icon: Sparkles, badge: 'NEW' },
  { name: 'Influencers', href: '/influencers',  icon: Users         },
  { name: 'Connections', href: '/connect',      icon: Plug          },
  { name: 'Sites',       href: '/sites',        icon: Globe         },
  { name: 'Settings',    href: '/settings',     icon: Settings      },
];

const secondaryNav = [
  { name: 'Reports',      href: '/reports', icon: FileText  },
  { name: 'Alerts',       href: '/alerts',  icon: Bell      },
  { name: 'Team Members', href: '/team',    icon: UserCheck },
];

export function Sidebar({ isMobileOpen, setIsMobileOpen, onLogout, pages = [], selectedPage, onPageSelect }: SidebarProps) {
  const pathname = usePathname();
  const [showPages, setShowPages] = useState(false);
  const { isCollapsed, toggleSidebar } = useSidebar();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex flex-col transform transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          w-64 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #16092a 100%)' }}
      >
        {/* Mobile close */}
        <button
          className="lg:hidden absolute top-4 right-4 text-purple-300 hover:text-white"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand selector */}
        <div className={`px-4 pt-5 pb-3 border-b border-purple-900/50 ${isCollapsed ? 'lg:px-2' : ''}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <div className={`flex-1 min-w-0 ${isCollapsed ? 'lg:flex-none' : ''}`}>
              {selectedPage ? (
                <button
                  onClick={() => { if (!isCollapsed) setShowPages(!showPages); }}
                  className={`flex items-center gap-2 bg-purple-800/40 hover:bg-purple-800/60 rounded-lg transition-colors
                    ${isCollapsed ? 'lg:px-2 lg:py-2' : 'w-full px-3 py-2'}`}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-400 shrink-0" />
                  <span className={`text-white font-semibold text-sm truncate flex-1 text-left ${isCollapsed ? 'lg:hidden' : ''}`}>
                    {selectedPage.name}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-purple-300 shrink-0 transition-transform ${showPages ? 'rotate-180' : ''} ${isCollapsed ? 'lg:hidden' : ''}`} />
                </button>
              ) : (
                <div className={`flex items-center gap-2 px-3 py-2 ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}`}>
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-400 shrink-0" />
                  <span className={`text-white font-semibold text-sm ${isCollapsed ? 'lg:hidden' : ''}`}>AdSync</span>
                </div>
              )}

              {/* Page dropdown */}
              {showPages && pages.length > 0 && !isCollapsed && (
                <div className="mt-1 bg-purple-900/80 rounded-lg overflow-hidden">
                  {pages.map(page => (
                    <button
                      key={page.id}
                      onClick={() => {
                        onPageSelect?.(page);
                        setShowPages(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors
                        ${page.id === selectedPage?.id
                          ? 'text-white bg-purple-700/50'
                          : 'text-purple-300 hover:text-white hover:bg-purple-800/40'
                        }`}
                    >
                      {page.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Primary Nav */}
        <nav className={`flex-1 py-4 space-y-0.5 overflow-y-auto ${isCollapsed ? 'lg:px-2' : 'px-3'}`}>
          {primaryNav.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-purple-700/60 text-white'
                    : 'text-purple-300 hover:text-white hover:bg-purple-800/40'
                  }
                  ${isCollapsed ? 'lg:justify-center lg:p-2' : 'px-3 py-2.5'}
                  px-3 py-2.5`}
              >
                <item.icon className={`shrink-0 ${isCollapsed ? 'lg:h-5 lg:w-5' : 'h-4 w-4'} h-4 w-4`} />
                <span className={`flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
                {(item as { badge?: string }).badge && (
                  <span className={`text-[10px] font-bold bg-purple-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wide ${isCollapsed ? 'lg:hidden' : ''}`}>
                    {(item as { badge?: string }).badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-3 border-t border-purple-900/50" />

          {/* Secondary Nav */}
          {secondaryNav.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-purple-700/60 text-white'
                    : 'text-purple-300 hover:text-white hover:bg-purple-800/40'
                  }
                  ${isCollapsed ? 'lg:justify-center lg:p-2' : 'px-3 py-2.5'}
                  px-3 py-2.5`}
              >
                <item.icon className={`shrink-0 ${isCollapsed ? 'lg:h-5 lg:w-5' : 'h-4 w-4'} h-4 w-4`} />
                <span className={`${isCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: logout */}
        <div className={`pb-2 space-y-2 ${isCollapsed ? 'lg:px-2' : 'px-3'}`}>
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium text-purple-400 hover:text-white hover:bg-purple-800/40 transition-colors
              ${isCollapsed ? 'lg:justify-center lg:p-2' : 'px-3 py-2.5'}
              px-3 py-2.5`}
          >
            <LogOut className={`shrink-0 ${isCollapsed ? 'lg:h-5 lg:w-5' : 'h-4 w-4'} h-4 w-4`} />
            <span className={`${isCollapsed ? 'lg:hidden' : ''}`}>Logout</span>
          </button>
        </div>

        {/* Desktop collapse toggle */}
        <div className="hidden lg:flex items-center justify-center border-t border-purple-900/50 py-3">
          <button
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-2 rounded-lg text-purple-400 hover:text-white hover:bg-purple-800/40 transition-colors"
          >
            {isCollapsed
              ? <ChevronRight className="h-4 w-4" />
              : <ChevronLeft className="h-4 w-4" />
            }
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
