'use client';

import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Menu } from 'lucide-react';
import type { FacebookPage } from '@/lib/types';

interface HeaderProps {
  onMenuClick: () => void;
  pages: FacebookPage[];
  selectedPage: FacebookPage | null;
  onPageSelect: (page: FacebookPage) => void;
  onLogout: () => void;
}

export function Header({ onMenuClick, pages, selectedPage, onPageSelect, onLogout }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center px-4 sm:px-6 gap-4 shrink-0 sticky top-0 z-10">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Page Selector */}
      <div className="flex items-center flex-1">
        {selectedPage && pages.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <span className="font-medium">{selectedPage.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Select Page</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {pages.map((page) => (
                <DropdownMenuItem
                  key={page.id}
                  onClick={() => onPageSelect(page)}
                  className="cursor-pointer"
                >
                  <span className={page.id === selectedPage.id ? 'font-semibold' : ''}>
                    {page.name}
                  </span>
                  {page.id === selectedPage.id && (
                    <span className="ml-auto text-xs text-blue-600">Active</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <span className="font-medium">Account</span>
                {selectedPage && (
                  <span className="text-xs text-slate-600 truncate">
                    {selectedPage.name}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
