'use client';

import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  BellIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { FacebookPage } from '@/lib/types';
import { ModernSelect } from '../modern/ModernSelect';

interface TopBarProps {
  pages: FacebookPage[];
  selectedPage: FacebookPage | null;
  onPageSelect: (page: FacebookPage) => void;
}

export function TopBar({ pages, selectedPage, onPageSelect }: TopBarProps) {
  return (
    <div className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Bars3Icon className="w-6 h-6 text-slate-600" />
        </button>
        
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-600">Welcome back! Here's your overview</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl w-64">
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder-slate-400"
          />
        </div>

        {/* Page Selector */}
        <div className="w-64">
          <ModernSelect
            pages={pages}
            selectedPage={selectedPage}
            onSelect={onPageSelect}
          />
        </div>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <BellIcon className="w-6 h-6 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </motion.button>
      </div>
    </div>
  );
}
