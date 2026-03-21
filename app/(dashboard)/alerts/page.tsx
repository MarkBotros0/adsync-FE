'use client';

import { Bell, Plus, Zap, TrendingUp, TrendingDown, MessageSquare, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';

interface Alert {
  id: string;
  name: string;
  type: 'mention_spike' | 'negative_surge' | 'keyword' | 'influencer';
  condition: string;
  platform: string;
  enabled: boolean;
  triggered?: string;
}

const INITIAL_ALERTS: Alert[] = [
  { id: '1', name: 'Mention Spike Alert',     type: 'mention_spike',  condition: 'When mentions > 50/day',    platform: 'All Platforms', enabled: true,  triggered: '3 days ago' },
  { id: '2', name: 'Negative Sentiment Surge', type: 'negative_surge', condition: 'When negative % > 20%',     platform: 'Twitter',       enabled: true,  triggered: 'Never'      },
  { id: '3', name: 'Brand Keyword Monitor',    type: 'keyword',        condition: '"adsync" + "scam"',         platform: 'All Platforms', enabled: false, triggered: 'Never'      },
  { id: '4', name: 'Top Influencer Mention',   type: 'influencer',     condition: 'When follower count > 500K', platform: 'Twitter',       enabled: true,  triggered: '1 week ago' },
];

const TYPE_ICONS: Record<Alert['type'], React.ElementType> = {
  mention_spike:  Zap,
  negative_surge: TrendingDown,
  keyword:        MessageSquare,
  influencer:     TrendingUp,
};

const TYPE_COLORS: Record<Alert['type'], string> = {
  mention_spike:  'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
  negative_surge: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300',
  keyword:        'bg-slate-100 dark:bg-dk-raised text-slate-600 dark:text-purple-300',
  influencer:     'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300',
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-dk-surface border-b border-slate-200 dark:border-dk-border px-6 py-4 flex items-center gap-4">
        <h1 className="text-base font-bold text-slate-900 dark:text-purple-100">Alerts</h1>
        <span className="ml-auto flex items-center gap-1.5 bg-slate-200 dark:bg-dk-raised text-slate-400 dark:text-purple-500 text-xs font-medium px-3 py-1.5 rounded-lg cursor-not-allowed">
          <Plus className="h-3.5 w-3.5" />
          New Alert
          <span className="ml-1 text-[10px] font-semibold bg-slate-300 dark:bg-purple-900/60 text-slate-500 dark:text-purple-400 px-1.5 py-0.5 rounded uppercase tracking-wide">Soon</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-dk-bg">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Alerts',   value: alerts.filter(a => a.enabled).length.toString(),  color: 'text-green-600 dark:text-green-400' },
            { label: 'Triggered Today', value: '2',                                               color: 'text-blue-600 dark:text-blue-400'  },
            { label: 'Inactive Alerts', value: alerts.filter(a => !a.enabled).length.toString(), color: 'text-slate-500 dark:text-purple-400' },
            { label: 'Total Alerts',    value: alerts.length.toString(),                          color: 'text-slate-700 dark:text-purple-300' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-purple-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Alerts list */}
        <div className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-dk-border">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-purple-100">Your Alerts</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-dk-border">
            {alerts.map(alert => {
              const Icon = TYPE_ICONS[alert.type];
              const colorCls = TYPE_COLORS[alert.type];
              return (
                <div key={alert.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-dk-raised/60 transition-colors ${!alert.enabled ? 'opacity-60' : ''}`}>
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${colorCls}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-purple-100">{alert.name}</p>
                    <p className="text-xs text-slate-500 dark:text-purple-400">{alert.condition} · {alert.platform}</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-xs text-slate-400 dark:text-purple-500">Last triggered</p>
                    <p className="text-xs font-medium text-slate-600 dark:text-purple-300">{alert.triggered}</p>
                  </div>
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`shrink-0 transition-colors ${alert.enabled ? 'text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200' : 'text-slate-300 dark:text-dk-border hover:text-slate-500 dark:hover:text-purple-500'}`}
                  >
                    {alert.enabled
                      ? <ToggleRight className="h-6 w-6" />
                      : <ToggleLeft className="h-6 w-6" />
                    }
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 dark:bg-purple-900/20 border border-blue-200 dark:border-dk-border rounded-xl p-4 flex items-start gap-3">
          <Bell className="h-5 w-5 text-blue-500 dark:text-purple-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800 dark:text-purple-200">Real-time Notifications</p>
            <p className="text-xs text-blue-600 dark:text-purple-400 mt-1">
              Alerts are delivered via email and in-app notifications. Upgrade to receive Slack and WhatsApp notifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
