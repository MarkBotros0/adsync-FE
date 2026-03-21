'use client';

import { FileText, Download, Plus, Calendar, TrendingUp } from 'lucide-react';

const SAMPLE_REPORTS = [
  {
    id: '1',
    name: 'Monthly Brand Mentions — January 2026',
    created: 'Jan 15, 2026',
    type: 'Mentions',
    status: 'Ready',
  },
  {
    id: '2',
    name: 'Q4 2025 Sentiment Analysis Report',
    created: 'Jan 5, 2026',
    type: 'Sentiment',
    status: 'Ready',
  },
  {
    id: '3',
    name: 'Top Influencers — December 2025',
    created: 'Dec 31, 2025',
    type: 'Influencers',
    status: 'Ready',
  },
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <h1 className="text-base font-bold text-slate-900">Reports</h1>
        <span className="ml-auto flex items-center gap-1.5 bg-slate-200 text-slate-400 text-xs font-medium px-3 py-1.5 rounded-lg cursor-not-allowed">
          <Plus className="h-3.5 w-3.5" />
          New Report
          <span className="ml-1 text-[10px] font-semibold bg-slate-300 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wide">Soon</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Calendar, label: 'Scheduled Reports', desc: 'Set up automatic weekly or monthly reports', color: 'bg-blue-50 border-blue-200 text-blue-600' },
            { icon: TrendingUp, label: 'Custom Analytics', desc: 'Build reports with custom date ranges and filters', color: 'bg-purple-50 border-purple-200 text-purple-600' },
            { icon: Download, label: 'Export All Data', desc: 'Download all mentions and analytics as CSV/PDF', color: 'bg-green-50 border-green-200 text-green-600' },
          ].map(item => (
            <div key={item.label} className={`flex items-start gap-3 p-4 rounded-xl border text-left opacity-50 cursor-not-allowed ${item.color}`}>
              <item.icon className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{item.label}</p>
                  <span className="text-[10px] font-semibold bg-black/10 px-1.5 py-0.5 rounded uppercase tracking-wide">Soon</span>
                </div>
                <p className="text-xs opacity-70 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Reports list */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Recent Reports</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {SAMPLE_REPORTS.map(report => (
              <div key={report.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{report.name}</p>
                  <p className="text-xs text-slate-500">{report.type} · {report.created}</p>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                  {report.status}
                </span>
                <span className="text-slate-300 cursor-not-allowed" title="Coming soon">
                  <Download className="h-4 w-4" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
