'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon, Loader2, Send, Save, X } from 'lucide-react';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import { campaignTagsAPI, publishAPI } from '@/lib/api';
import type { CampaignTag, MediaAssetSummary, PublishDraft } from '@/lib/types';
import { EchofoldEmptyState } from '@/components/brand/echofold-empty-state';

const PLATFORMS: { key: string; label: string; charLimit: number }[] = [
  { key: 'facebook', label: 'Facebook', charLimit: 63206 },
  { key: 'instagram', label: 'Instagram', charLimit: 2200 },
  { key: 'tiktok', label: 'TikTok', charLimit: 2200 },
];

export default function ComposerPage() {
  const { token } = useBrandAuthContext();
  const [text, setText] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['facebook']);
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [mediaIds, setMediaIds] = useState<number[]>([]);
  const [tags, setTags] = useState<CampaignTag[]>([]);
  const [media, setMedia] = useState<MediaAssetSummary[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState<PublishDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    campaignTagsAPI.list(token).then(r => setTags(r.data as CampaignTag[])).catch(() => {});
    publishAPI.listMedia(token).then(r => setMedia(r.data as MediaAssetSummary[])).catch(() => {});
  }, [token]);

  const togglePlatform = (k: string) => {
    setPlatforms(prev => prev.includes(k) ? prev.filter(p => p !== k) : [...prev, k]);
  };

  const toggleTag = (id: number) => {
    setTagIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const toggleMedia = (id: number) => {
    setMediaIds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const res = await publishAPI.createDraft(token, {
        text,
        platforms,
        media_asset_ids: mediaIds,
        campaign_tag_ids: tagIds,
        scheduled_at: scheduledAt || null,
      });
      setDraft(res.data as PublishDraft);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!token || !draft) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await publishAPI.submit(token, draft.id);
      setDraft(res.data as PublishDraft);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <EchofoldEmptyState
        icon={Send}
        title="Sign in to compose"
        description="The composer is brand-authenticated."
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-dk-border dark:bg-dk-surface">
        <h1 className="text-base font-bold text-slate-900 dark:text-purple-100">Compose</h1>
        <p className="text-sm text-slate-500">Draft a post, schedule it, and submit for approval.</p>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-dk-bg">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[2fr_1fr]">

          {/* Editor */}
          <div className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-dk-border dark:bg-dk-surface">
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Caption
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What do you want to say?"
                rows={8}
                className="mt-2 w-full resize-none rounded-md border border-slate-200 bg-slate-50 p-3 text-sm focus:border-purple-400 focus:outline-none dark:border-dk-border dark:bg-dk-bg dark:text-slate-100"
              />
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                {PLATFORMS.filter(p => platforms.includes(p.key)).map(p => (
                  <span key={p.key} className={text.length > p.charLimit ? 'text-rose-500' : ''}>
                    {p.label}: {text.length}/{p.charLimit}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-dk-border dark:bg-dk-surface">
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Platforms
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {PLATFORMS.map(p => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => togglePlatform(p.key)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition-colors ${
                      platforms.includes(p.key)
                        ? 'bg-purple-600 text-white ring-purple-600'
                        : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-dk-border dark:bg-dk-surface">
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Schedule (optional)
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-sm dark:border-dk-border dark:bg-dk-bg dark:text-slate-100"
              />
            </section>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving || platforms.length === 0 || !text.trim()}
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {draft ? 'Update draft' : 'Save draft'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!draft || submitting}
                className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit for approval
              </button>
              {draft && <span className="text-xs text-slate-500">Draft #{draft.id} · {draft.status}</span>}
              {error && <span className="text-xs text-rose-600">{error}</span>}
            </div>
          </div>

          {/* Sidebar: tags + media */}
          <aside className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-dk-border dark:bg-dk-surface">
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Campaign tags
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.length === 0 && (
                  <span className="text-xs text-slate-500">
                    No tags yet — create them on /campaign-tags.
                  </span>
                )}
                {tags.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
                      tagIds.includes(t.id) ? 'text-white ring-transparent' : 'text-slate-600 ring-slate-200'
                    }`}
                    style={tagIds.includes(t.id) ? { backgroundColor: t.color } : undefined}
                  >
                    {t.name}
                    {tagIds.includes(t.id) && <X className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-dk-border dark:bg-dk-surface">
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Media
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {media.length === 0 && (
                  <span className="col-span-2 text-xs text-slate-500">
                    Upload media on /publish/media first.
                  </span>
                )}
                {media.map(m => {
                  const selected = mediaIds.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMedia(m.id)}
                      className={`relative aspect-square overflow-hidden rounded-md border-2 ${
                        selected ? 'border-purple-600' : 'border-slate-200'
                      }`}
                    >
                      {m.kind === 'image' ? (
                        <img
                          src={publishAPI.mediaRawUrl(m.id)}
                          alt={m.filename}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-slate-100 text-xs text-slate-500">
                          <ImageIcon className="mr-1 h-3 w-3" />
                          Video
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
