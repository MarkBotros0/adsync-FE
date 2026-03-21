'use client';

import { Users, Plus, Mail } from 'lucide-react';

const TEAM = [
  { id: '1', name: 'You (Owner)', email: 'you@adsync.io', role: 'Owner', avatar: 'YO' },
];

export default function TeamPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-dk-surface border-b border-slate-200 dark:border-dk-border px-6 py-4 flex items-center gap-4">
        <h1 className="text-base font-bold text-slate-900 dark:text-purple-100">Team Members</h1>
        <span className="ml-auto flex items-center gap-1.5 bg-slate-200 dark:bg-dk-raised text-slate-400 dark:text-purple-500 text-xs font-medium px-3 py-1.5 rounded-lg cursor-not-allowed">
          <Plus className="h-3.5 w-3.5" />
          Invite Member
          <span className="ml-1 text-[10px] font-semibold bg-slate-300 dark:bg-purple-900/60 text-slate-500 dark:text-purple-400 px-1.5 py-0.5 rounded uppercase tracking-wide">Soon</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-dk-bg">
        <div className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-dk-border">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-purple-100">Current Members</h2>
          </div>
          {TEAM.map(member => (
            <div key={member.id} className="flex items-center gap-4 px-5 py-4">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-sm font-bold text-purple-600 dark:text-purple-300">
                {member.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-purple-100">{member.name}</p>
                <p className="text-xs text-slate-500 dark:text-purple-400">{member.email}</p>
              </div>
              <span className="text-xs font-medium bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full">
                {member.role}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-dk-raised rounded-xl border border-purple-200 dark:border-dk-border p-8 text-center">
          <Users className="h-12 w-12 text-purple-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-purple-100 mb-2">Collaborate with your team</h3>
          <p className="text-sm text-slate-600 dark:text-purple-300 max-w-sm mx-auto mb-4">
            Invite team members to collaborate on brand monitoring, analytics, and reports.
          </p>
          <span className="flex items-center gap-2 mx-auto bg-slate-200 dark:bg-dk-raised text-slate-400 dark:text-purple-500 text-sm font-medium px-4 py-2 rounded-lg cursor-not-allowed">
            <Mail className="h-4 w-4" />
            Send Invitations
            <span className="text-[10px] font-semibold bg-slate-300 dark:bg-purple-900/60 text-slate-500 dark:text-purple-400 px-1.5 py-0.5 rounded uppercase tracking-wide">Soon</span>
          </span>
        </div>
      </div>
    </div>
  );
}
