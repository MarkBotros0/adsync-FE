'use client';

import { useCallback, useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Download, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import { reportsAPI } from '@/lib/api';
import type { ReportRunSummary, ReportSchedule } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EchofoldEmptyState } from '@/components/brand/echofold-empty-state';

export default function ReportsPage() {
  const { token } = useBrandAuthContext();
  const [tab, setTab] = useState('one-off');
  const [runs, setRuns] = useState<ReportRunSummary[]>([]);
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [generating, setGenerating] = useState(false);
  const [windowDays, setWindowDays] = useState(30);

  const refresh = useCallback(() => {
    if (!token) return;
    reportsAPI.listRuns(token).then(r => setRuns(r.data as ReportRunSummary[])).catch(() => {});
    reportsAPI.listSchedules(token).then(r => setSchedules(r.data as ReportSchedule[])).catch(() => {});
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleGenerate = async () => {
    if (!token) return;
    setGenerating(true);
    try {
      const end = new Date();
      const start = new Date(end.getTime() - windowDays * 86400000);
      await reportsAPI.generate(token, {
        period_start: start.toISOString(),
        period_end: end.toISOString(),
        sections: ['overview', 'audience'],
      });
      refresh();
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateSchedule = async () => {
    if (!token) return;
    const name = prompt('Schedule name:', 'Weekly performance report');
    if (!name) return;
    const recipients = prompt('Recipients (comma-separated emails):');
    if (!recipients) return;
    const cadence = (prompt('Cadence (weekly | monthly):', 'weekly') ?? 'weekly') as 'weekly' | 'monthly';
    await reportsAPI.createSchedule(token, {
      name,
      cadence,
      recipients: recipients.split(',').map(s => s.trim()).filter(Boolean),
      template: { window_days: windowDays, sections: ['overview', 'audience'] },
    });
    refresh();
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!token) return;
    if (!confirm('Delete this schedule?')) return;
    await reportsAPI.deleteSchedule(token, id);
    refresh();
  };

  const handleRunNow = async (id: number) => {
    if (!token) return;
    await reportsAPI.runScheduleNow(token, id);
    refresh();
  };

  if (!token) {
    return <EchofoldEmptyState icon={FileText} title="Sign in to view reports" description="" />;
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-dk-border dark:bg-dk-surface">
        <h1 className="text-base font-bold text-slate-900 dark:text-purple-100">Reports</h1>
        <p className="text-sm text-slate-500">Branded PDF reports and scheduled email delivery.</p>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-dk-bg">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="one-off">Generate now</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="runs">History</TabsTrigger>
          </TabsList>

          <TabsContent value="one-off" className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-dk-border dark:bg-dk-surface">
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Window (days)
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={windowDays}
                onChange={(e) => setWindowDays(Math.max(1, Math.min(365, Number(e.target.value))))}
                className="mt-2 w-32 rounded-md border border-slate-200 bg-slate-50 p-2 text-sm dark:border-dk-border dark:bg-dk-bg dark:text-slate-100"
              />
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="ml-3 inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Generate PDF
              </button>
            </div>
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{schedules.length} scheduled report{schedules.length === 1 ? '' : 's'}.</p>
              <button
                onClick={handleCreateSchedule}
                className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
              >
                <Plus className="h-3 w-3" /> New schedule
              </button>
            </div>
            {schedules.length === 0 ? (
              <EchofoldEmptyState
                icon={CalendarIcon}
                title="No recurring reports"
                description="Schedule a weekly or monthly PDF that lands in inboxes automatically."
              />
            ) : (
              <ul className="space-y-2">
                {schedules.map(s => (
                  <li
                    key={s.id}
                    className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-dk-border dark:bg-dk-surface"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-purple-100">{s.name}</p>
                      <p className="text-xs text-slate-500">
                        {s.cadence} · next run {new Date(s.next_sent_at).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">to {s.recipients_csv}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRunNow(s.id)}
                        className="rounded-md border border-slate-200 px-3 py-1 text-xs hover:bg-slate-50 dark:border-dk-border"
                      >
                        Run now
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(s.id)}
                        className="rounded-md text-rose-500 hover:text-rose-700"
                        aria-label="Delete schedule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="runs">
            {runs.length === 0 ? (
              <EchofoldEmptyState
                icon={FileText}
                title="No reports generated yet"
                description="Generate a one-off PDF or wait for your first scheduled run."
              />
            ) : (
              <ul className="space-y-2">
                {runs.map(r => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-dk-border dark:bg-dk-surface"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-purple-100">
                        {new Date(r.period_start).toLocaleDateString()} → {new Date(r.period_end).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {r.status} · {r.generated_at ? new Date(r.generated_at).toLocaleString() : 'pending'}
                      </p>
                      {r.error_message && <p className="text-xs text-rose-600">{r.error_message}</p>}
                    </div>
                    {r.status === 'ready' && (
                      <a
                        href={reportsAPI.pdfUrl(r.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                      >
                        <Download className="h-3 w-3" /> PDF
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
