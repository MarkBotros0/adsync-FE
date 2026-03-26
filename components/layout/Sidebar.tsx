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
  Building2,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plug,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { type FacebookPage, UserRole } from '@/lib/types';
import { useSidebar } from '@/contexts/sidebar-context';
import { BrandSwitcher } from '@/components/layout/brand-switcher';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onLogout: () => void;
  userRole?: UserRole | null;
  pages?: FacebookPage[];
  selectedPage?: FacebookPage | null;
  onPageSelect?: (page: FacebookPage) => void;
}

// Navigation for SUPER users — platform management only
const superNav = [
  { name: 'Users',  href: '/users',  icon: Users     },
  { name: 'Brands', href: '/brands', icon: Building2 },
];

// Navigation for ADMIN + NORMAL users
const primaryNav = [
  { name: 'Content',      href: '/content',      icon: MessageSquare },
  { name: 'Analytics',    href: '/analytics',    icon: BarChart2     },
  { name: 'AI Digest',    href: '/ai-digest',    icon: Sparkles,  badge: 'Soon' },
  { name: 'Influencers',  href: '/influencers',  icon: Users,     badge: 'Soon' },
  { name: 'Sites',        href: '/sites',        icon: Globe,     badge: 'Soon' },
  { name: 'Alerts',       href: '/alerts',       icon: Bell,      badge: 'Soon' },
];

// Tabs visible to ADMIN / ORG_ADMIN only
const teamNav = { name: 'Team', href: '/team', icon: UserCheck };
const brandsNav = { name: 'Brands', href: '/brands', icon: Building2 };

const secondaryNav = [
  { name: 'Connections', href: '/connect',  icon: Plug                     },
  { name: 'Reports',     href: '/reports',  icon: FileText, badge: 'Soon'  },
  { name: 'Settings',    href: '/settings', icon: Settings                 },
];

export function Sidebar({
  isMobileOpen, setIsMobileOpen, onLogout,
  userRole, pages = [], selectedPage, onPageSelect,
}: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const isSuper = userRole === UserRole.SUPER;
  const isOrgAdmin = userRole === UserRole.ORG_ADMIN;
  const isAdmin = userRole === UserRole.ADMIN || isOrgAdmin;
  
  // Prevent hydration mismatch by only showing role-specific UI after mount
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Build nav items based on role — gated on `mounted` to avoid hydration mismatch
  // (userRole is client-side data; server always sees null).
  // Before mount, render an empty nav so super users don't see a flash of non-super tabs.
  const mainNav = mounted
    ? (isSuper ? superNav : isAdmin ? [...primaryNav, teamNav, brandsNav] : primaryNav)
    : [];

  const showSecondaryNav = mounted && !isSuper;

  const NavLink = ({ item }: { item: { name: string; href: string; icon: React.ElementType; badge?: string } }) => {
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        onClick={() => setIsMobileOpen(false)}
        className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-colors
          ${active ? 'bg-violet-500/20 text-white' : 'text-slate-400 hover:text-white hover:bg-white/6'}
          ${isCollapsed ? 'lg:justify-center lg:p-2' : 'px-3 py-2.5'}
          px-3 py-2.5`}
      >
        <item.icon className={`shrink-0 ${isCollapsed ? 'lg:h-5 lg:w-5' : 'h-4 w-4'} h-4 w-4`} />
        <span className={`flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
        {item.badge && (
          <span className={`text-[10px] font-bold bg-violet-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wide ${isCollapsed ? 'lg:hidden' : ''}`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-40 flex flex-col transform transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          w-64 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg, #15151d 0%, #0e0e13 100%)' }}
      >
        {/* Mobile close */}
        <button
          className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-white"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand switcher — hidden for SUPER (they manage brands separately) */}
        {!isSuper && mounted && (
          <div className={`px-4 pt-5 pb-3 border-b border-white/8 ${isCollapsed ? 'lg:px-2' : ''}`}>
            <BrandSwitcher isCollapsed={isCollapsed} onClose={() => setIsMobileOpen(false)} />
          </div>
        )}

        {/* SUPER role header */}
        {isSuper && (
          <div className={`px-4 pt-5 pb-3 border-b border-white/8 ${isCollapsed ? 'lg:px-2' : ''}`}>
            <div className={`flex items-center gap-2 px-3 py-2 ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}`}>
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0" />
              <span className={`text-amber-300 font-semibold text-sm ${isCollapsed ? 'lg:hidden' : ''}`}>Super Admin</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={`flex-1 py-4 space-y-0.5 overflow-y-auto ${isCollapsed ? 'lg:px-2' : 'px-3'}`}>
          {mainNav.map(item => <NavLink key={item.name} item={item} />)}

          {showSecondaryNav && (
            <>
              <div className="my-3 border-t border-white/8" />
              {secondaryNav.map(item => <NavLink key={item.name} item={item} />)}
            </>
          )}
        </nav>

        {/* Logout */}
        <div className={`pb-2 space-y-2 ${isCollapsed ? 'lg:px-2' : 'px-3'}`}>
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/6 transition-colors
              ${isCollapsed ? 'lg:justify-center lg:p-2' : 'px-3 py-2.5'}
              px-3 py-2.5`}
          >
            <LogOut className={`shrink-0 ${isCollapsed ? 'lg:h-5 lg:w-5' : 'h-4 w-4'} h-4 w-4`} />
            <span className={`${isCollapsed ? 'lg:hidden' : ''}`}>Logout</span>
          </button>
        </div>

        {/* Desktop collapse toggle */}
        <div className="hidden lg:flex items-center justify-center border-t border-white/8 py-3">
          <button
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/6 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
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
