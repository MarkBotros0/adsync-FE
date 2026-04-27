'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon, Loader2, Send, Save, Upload, X } from 'lucide-react';
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
  const [tags, setTags] = useState<CampaignTag[]>([]);

  // Inline media: every file the user picks is uploaded immediately and the
  // returned asset row is held here. There's no separate library — assets only
  // live for the lifetime of this composer session.
  const [attachments, setAttachments] = useState<MediaAssetSummary[]>([]);
  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState<PublishDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    campaignTagsAPI.list(token).then(r => setTags(r.data as CampaignTag[])).catch(() => {});
  }, [token]);

  const togglePlatform = (k: string) => {
    setPlatforms(prev => prev.includes(k) ? prev.filter(p => p !== k) : [...prev, k]);
  };

  const toggleTag = (id: number) => {
    setTagIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!token) return;
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      // Upload sequentially so any single failure surfaces with the right filename.
      for (const file of files) {
        try {
          const res = await publishAPI.uploadMedia(token, file);
          setAttachments(prev => [...prev, res.data as MediaAssetSummary]);
        } catch (err) {
          setError(`Upload failed for ${file.name}: ${(err as Error).message}`);
        }
      }
    } finally {
      setUploading(false);
      e.target.value = ''; // allow re-uploading the same filename
    }
  };

  const removeAttachment = (id: number) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
    // We deliberately don't call deleteMedia — the row stays as orphaned bytes
    // until the brand's data is purged. The composer doesn't need to be the
    // garbage collector, and the user might re-add it without re-uploading.
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        text,
        platforms,
        media_asset_ids: attachments.map(a => a.id),
        campaign_tag_ids: tagIds,
        scheduled_at: scheduledAt || null,
      };
      const res = draft
        ? await publishAPI.updateDraft(token, draft.id, payload)
        : await publishAPI.createDraft(token, payload);
      setDraft(res.data as PublishDraft);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      // If the user clicks "Submit" without first saving, do both in one go.
      let current = draft;
      if (!current) {
        const created = await publishAPI.createDraft(token, {
          text,
          platforms,
          media_asset_ids: attachments.map(a => a.id),
          campaign_tag_ids: tagIds,
          scheduled_at: scheduledAt || null,
        });
        current = created.data as PublishDraft;
        setDraft(current);
      }
      const res = await publishAPI.submit(token, current.id);
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
      <header className="border-b border-slate-200 bg-white px-4 py-4 dark:border-dk-border dark:bg-dk-surface sm:px-6">
        <h1 className="text-base font-bold text-slate-900 dark:text-purple-100">Compose</h1>
        <p className="text-sm text-slate-500 dark:text-purple-400">Draft a post, attach media, schedule, and submit for approval.</p>
      </header>

      <div className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 dark:bg-dk-bg sm:p-6">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[2fr_1fr]">

          {/* Editor */}
          <div className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-dk-border dark:bg-dk-surface">
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-purple-400">
                Caption
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What do you want to say?"
                rows={8}
                className="mt-2 w-full resize-none rounded-md border border-slate-200 bg-slate-50 p-3 text-sm focus:border-purple-400 focus:outline-none dark:border-dk-border dark:bg-dk-bg dark:text-slate-100"
              />
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-purple-400">
                {PLATFORMS.filter(p => platforms.includes(p.key)).map(p => (
                  <span key={p.key} className={text.length > p.charLimit ? 'text-rose-500 dark:text-rose-400' : ''}>
                    {p.label}: {text.length}/{p.charLimit}
                  </span>
                ))}
              </div>
            </section>

            {/* Inline media — uploaded immediately on file pick. No library. */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-dk-border dark:bg-dk-surface">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-purple-400">
                  Media
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-dk-border dark:bg-dk-raised dark:text-purple-100 dark:hover:bg-dk-bg">
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Add files
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    hidden
                    onChange={handleFiles}
                  />
                </label>
              </div>

              {attachments.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500 dark:text-purple-400">
                  Drop in images or a video — they upload as you add them and travel with this post.
                </p>
              ) : (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {attachments.map(a => (
                    <div
                      key={a.id}
                      className="group relative aspect-square overflow-hidden rounded-md border border-slate-200 dark:border-dk-border"
                    >
                      {a.kind === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={publishAPI.mediaRawUrl(a.id)}
                          alt={a.filename}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-slate-100 text-[10px] text-slate-500 dark:bg-dk-raised dark:text-purple-400">
                          <ImageIcon className="mr-1 h-3 w-3" />
                          Video
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeAttachment(a.id)}
                        aria-label={`Remove ${a.filename}`}
                        className="absolute right-1 top-1 rounded-full bg-slate-900/70 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-dk-border dark:bg-dk-surface">
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-purple-400">
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
                        : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 dark:bg-dk-raised dark:text-purple-300 dark:ring-dk-border dark:hover:bg-dk-bg'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-dk-border dark:bg-dk-surface">
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-purple-400">
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
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-dk-border dark:bg-dk-surface dark:text-purple-100 dark:hover:bg-dk-raised"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {draft ? 'Update draft' : 'Save draft'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || platforms.length === 0 || !text.trim()}
                className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit for approval
              </button>
              {draft && <span className="text-xs text-slate-500 dark:text-purple-400">Draft #{draft.id} · {draft.status}</span>}
              {error && <span className="text-xs text-rose-500 dark:text-rose-400">{error}</span>}
            </div>
          </div>

          {/* Sidebar: tags */}
          <aside className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-dk-border dark:bg-dk-surface">
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-purple-400">
                Campaign tags
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.length === 0 && (
                  <span className="text-xs text-slate-500 dark:text-purple-400">
                    No tags yet — create them on /campaign-tags.
                  </span>
                )}
                {tags.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
                      tagIds.includes(t.id)
                        ? 'text-white ring-transparent'
                        : 'text-slate-600 ring-slate-200 dark:text-purple-300 dark:ring-dk-border'
                    }`}
                    style={tagIds.includes(t.id) ? { backgroundColor: t.color } : undefined}
                  >
                    {t.name}
                    {tagIds.includes(t.id) && <X className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
