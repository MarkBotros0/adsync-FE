'use client';

export default function InstagramPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Instagram Analytics</h1>
        <p className="text-slate-600">Track your Instagram profile performance and engagement</p>
      </div>

      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-12 text-center border border-pink-200">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
          <span className="text-4xl">📸</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3">Instagram Coming Soon</h3>
        <p className="text-slate-600 text-lg">
          Instagram integration will be available soon. Connect your Instagram Business account to track posts, stories, and engagement metrics.
        </p>
      </div>
    </div>
  );
}
