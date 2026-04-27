'use client';

import { useCallback, useEffect, useState } from 'react';
import { Image as ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import { publishAPI } from '@/lib/api';
import type { MediaAssetSummary } from '@/lib/types';
import { EchofoldEmptyState } from '@/components/brand/echofold-empty-state';

export default function MediaLibraryPage() {
  const { token } = useBrandAuthContext();
  const [assets, setAssets] = useState<MediaAssetSummary[]>([]);
  const [uploading, setUploading] = useState(false);

  const refresh = useCallback(() => {
    if (!token) return;
    publishAPI.listMedia(token).then(r => setAssets(r.data as MediaAssetSummary[])).catch(() => {});
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      await publishAPI.uploadMedia(token, file);
      refresh();
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm('Delete this asset? Drafts that reference it will fail to publish.')) return;
    await publishAPI.deleteMedia(token, id);
    refresh();
  };

  if (!token) {
    return <EchofoldEmptyState icon={ImageIcon} title="Sign in to manage media" description="" />;
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-dk-border dark:bg-dk-surface">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-purple-100">Media library</h1>
          <p className="text-sm text-slate-500">Files are stored inside your workspace database — no third-party storage.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload
          <input type="file" accept="image/*,video/*" hidden onChange={handleUpload} />
        </label>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-dk-bg">
        {assets.length === 0 ? (
          <EchofoldEmptyState
            icon={ImageIcon}
            title="No media yet"
            description="Upload an image or video to use in your scheduled posts."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {assets.map(a => (
              <div key={a.id} className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-dk-border dark:bg-dk-surface">
                {a.kind === 'image' ? (
                  <img
                    src={publishAPI.mediaRawUrl(a.id)}
                    alt={a.filename}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-slate-100 text-xs text-slate-500 dark:bg-dk-bg">
                    Video
                  </div>
                )}
                <div className="flex items-center justify-between p-2 text-xs">
                  <span className="truncate" title={a.filename}>{a.filename}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="text-rose-500 opacity-0 transition-opacity hover:text-rose-700 group-hover:opacity-100"
                    aria-label="Delete asset"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
