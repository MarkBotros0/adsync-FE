'use client';

export default function TikTokPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">TikTok Analytics</h1>
        <p className="text-slate-600">Track your TikTok profile performance and video engagement</p>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-zinc-50 rounded-lg p-12 text-center border border-slate-200">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          <span className="text-4xl">🎵</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3">TikTok Coming Soon</h3>
        <p className="text-slate-600 text-lg">
          TikTok integration will be available soon. Connect your TikTok Business account to track videos, views, and engagement metrics.
        </p>
      </div>
    </div>
  );
}
