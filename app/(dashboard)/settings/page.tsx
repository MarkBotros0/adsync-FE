'use client';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-600">Manage your account and application preferences</p>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-zinc-50 rounded-lg p-12 text-center border border-slate-200">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-600 to-zinc-700 flex items-center justify-center">
          <span className="text-4xl">⚙️</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3">Settings Coming Soon</h3>
        <p className="text-slate-600 text-lg">
          Settings and preferences will be available soon.
        </p>
      </div>
    </div>
  );
}
