'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import { toast } from 'sonner';
import { Building2, Plus, Globe, Users, Loader2, X } from 'lucide-react';
import type { Brand } from '@/lib/types';
import { AxiosError } from 'axios';

function getApiError(err: unknown, fallback: string): string {
  return (err as AxiosError<{ detail?: string }>)?.response?.data?.detail ?? fallback;
}

// ─── Create Brand Modal ───────────────────────────────────────────────────────

function CreateBrandModal({
  onClose,
  onCreated,
  token,
}: {
  onClose: () => void;
  onCreated: () => void;
  token: string;
}) {
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await adminAPI.createBrand(token, {
        name: name.trim(),
        website: website.trim() || undefined,
        industry: industry.trim() || undefined,
      });
      toast.success(`Brand "${name}" created`);
      onCreated();
      onClose();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to create brand'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-[#1a1a28] border border-white/10 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">New Brand</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { label: 'Brand name', value: name, onChange: setName, placeholder: 'Acme Inc.', required: true },
            { label: 'Website', value: website, onChange: setWebsite, placeholder: 'https://acme.com', required: false },
            { label: 'Industry', value: industry, onChange: setIndustry, placeholder: 'Technology', required: false },
          ].map(f => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wide">{f.label}</label>
              <input
                type="text" required={f.required} value={f.value} onChange={e => f.onChange(e.target.value)}
                placeholder={f.placeholder}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
              />
            </div>
          ))}

          <button
            type="submit" disabled={loading || !name.trim()}
            className="mt-2 w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create Brand
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BrandsPage() {
  const auth = useBrandAuthContext();
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!auth.isLoading && auth.user?.role !== 'SUPER') {
      router.replace('/content');
    }
  }, [auth.isLoading, auth.user, router]);

  const loadBrands = useCallback(async () => {
    if (!auth.token) return;
    setLoading(true);
    try {
      const res = await adminAPI.listBrands(auth.token);
      setBrands(res.data.brands);
    } catch {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    if (auth.token && !auth.isLoading) loadBrands();
  }, [auth.token, auth.isLoading, loadBrands]);

  if (auth.isLoading || auth.user?.role !== 'SUPER') {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-7 w-7 animate-spin text-purple-400" /></div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Brands</h1>
            <p className="text-sm text-white/40">{brands.length} total</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Brand
        </button>
      </div>

      {/* Brands grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-purple-400" />
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No brands yet. Create the first one.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map(brand => (
            <div key={brand.id} className="bg-white/[0.03] border border-white/8 rounded-xl p-5 hover:bg-white/[0.05] transition-colors">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-600/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-purple-300">{brand.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{brand.name}</p>
                  {brand.industry && (
                    <p className="text-white/40 text-xs mt-0.5">{brand.industry}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/40">
                {brand.website && (
                  <a href={brand.website} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 hover:text-white/70 transition-colors">
                    <Globe className="h-3.5 w-3.5" />
                    Website
                  </a>
                )}
                {brand.subscription && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {brand.subscription.display_name}
                  </span>
                )}
              </div>

              <p className="mt-3 text-[11px] text-white/20">
                Created {new Date(brand.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateBrandModal
          token={auth.token!}
          onClose={() => setShowCreate(false)}
          onCreated={loadBrands}
        />
      )}
    </div>
  );
}
