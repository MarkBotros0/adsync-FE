'use client';

import { motion } from 'framer-motion';
import { Platform, PLATFORMS } from '@/lib/types';
import { 
  ChatBubbleLeftRightIcon, 
  CameraIcon, 
  MusicalNoteIcon 
} from '@heroicons/react/24/outline';

interface PlatformTabsProps {
  selected: Platform[];
  onChange: (platforms: Platform[]) => void;
}

const platformConfig = [
  { 
    id: PLATFORMS.FACEBOOK, 
    name: 'Facebook', 
    icon: ChatBubbleLeftRightIcon, 
    color: 'from-blue-500 to-blue-600',
    available: true 
  },
  { 
    id: PLATFORMS.INSTAGRAM, 
    name: 'Instagram', 
    icon: CameraIcon, 
    color: 'from-pink-500 to-purple-600',
    available: false 
  },
  { 
    id: PLATFORMS.TIKTOK, 
    name: 'TikTok', 
    icon: MusicalNoteIcon, 
    color: 'from-slate-800 to-slate-900',
    available: false 
  },
];

export function PlatformTabs({ selected, onChange }: PlatformTabsProps) {
  const togglePlatform = (platform: Platform) => {
    if (selected.includes(platform)) {
      onChange(selected.filter(p => p !== platform));
    } else {
      onChange([...selected, platform]);
    }
  };

  return (
    <div className="flex gap-3">
      {platformConfig.map(({ id, name, icon: Icon, color, available }) => {
        const isSelected = selected.includes(id);
        
        return (
          <motion.button
            key={id}
            onClick={() => available && togglePlatform(id)}
            disabled={!available}
            whileHover={available ? { scale: 1.05 } : {}}
            whileTap={available ? { scale: 0.95 } : {}}
            className={`
              relative flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-sm
              transition-all duration-300 overflow-hidden
              ${isSelected 
                ? 'text-white shadow-lg' 
                : available 
                  ? 'bg-white/80 backdrop-blur-xl text-slate-700 border border-slate-200/60 hover:shadow-lg' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {isSelected && (
              <motion.div
                layoutId="activeTab"
                className={`absolute inset-0 bg-gradient-to-r ${color}`}
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <Icon className="w-5 h-5 relative z-10" />
            <span className="relative z-10">{name}</span>
            {!available && (
              <span className="relative z-10 text-xs opacity-60">Soon</span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
