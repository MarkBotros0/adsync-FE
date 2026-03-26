'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI, organizationAPI } from '@/lib/api';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import { toast } from 'sonner';
import { Building2, Plus, Globe, Check, Loader2, X, Pencil } from 'lucide-react';
import { type Brand, UserRole } from '@/lib/types';
import { AxiosError } from 'axios';

function getApiError(err: unknown, fallback: string): string {
  return (err as AxiosError<{ detail?: string }>)?.response?.data?.detail ?? fallback;
}

// ─── Shared form fields ────────────────────────────────────────────────────────

interface BrandFormFields {
  name: string;
  website: string;
  industry: string;
}

function BrandFields({
  fields,
  onChange,
  nameRequired,
}: {
  fields: BrandFormFields;
  onChange: (fields: BrandFormFields) => void;
  nameRequired: boolean;
}) {
  return (
    <>
      {(
        [
          { key: 'name', label: 'Brand name', placeholder: 'Acme Inc.', required: nameRequired },
          { key: 'website', label: 'Website', placeholder: 'https://acme.com', required: false },
          { key: 'industry', label: 'Industry', placeholder: 'Technology', required: false },
        ] as const
      ).map(f => (
        <div key={f.key} className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wide">{f.label}</label>
          <input
            type="text"
            required={f.required}
            value={fields[f.key]}
            onChange={e => onChange({ ...fields, [f.key]: e.target.value })}
            placeholder={f.placeholder}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
          />
        </div>
      ))}
    </>
  );
}

// ─── Create Brand Modal ───────────────────────────────────────────────────────

function CreateBrandModal({
  onClose,
  onCreated,
  token,
  isFirstBrand,
}: {
  onClose: () => void;
  onCreated: (brand: Brand) => void;
  token: string;
  isFirstBrand: boolean;
}) {
  const [fields, setFields] = useState<BrandFormFields>({ name: '', website: '', industry: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.name.trim()) return;
    setLoading(true);
    try {
      const res = await organizationAPI.createBrand(token, {
        name: fields.name.trim(),
        website: fields.website.trim() || undefined,
        industry: fields.industry.trim() || undefined,
      });
      toast.success(`Brand "${fields.name}" created`);
      onCreated(res.data.brand);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to create brand'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-[#1a1a28] border border-white/10 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white font-semibold text-lg">
            {isFirstBrand ? 'Create your first brand' : 'New Brand'}
          </h2>
          {!isFirstBrand && (
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {isFirstBrand && (
          <p className="text-white/40 text-sm mb-5">
            Set up a brand workspace to get started. You can add more brands later.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <BrandFields fields={fields} onChange={setFields} nameRequired />

          <button
            type="submit"
            disabled={loading || !fields.name.trim()}
            className="mt-2 w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {isFirstBrand ? 'Create & Get Started' : 'Create Brand'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Brand Modal ─────────────────────────────────────────────────────────

function EditBrandModal({
  brand,
  onClose,
  onSaved,
  token,
}: {
  brand: Brand;
  onClose: () => void;
  onSaved: (updated: Brand) => void;
  token: string;
}) {
  const [fields, setFields] = useState<BrandFormFields>({
    name: brand.name,
    website: brand.website ?? '',
    industry: brand.industry ?? '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.name.trim()) return;
    setLoading(true);
    try {
      const res = await organizationAPI.updateBrand(token, brand.id, {
        name: fields.name.trim(),
        website: fields.website.trim() || undefined,
        industry: fields.industry.trim() || undefined,
      });
      toast.success('Brand updated');
      onSaved(res.data.brand);
      onClose();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to update brand'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-[#1a1a28] border border-white/10 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">Edit Brand</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <BrandFields fields={fields} onChange={setFields} nameRequired />

          <button
            type="submit"
            disabled={loading || !fields.name.trim()}
            className="mt-2 w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save Changes
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
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [switching, setSwitching] = useState<number | null>(null);

  const isSuper = auth.user?.role === UserRole.SUPER;
  const isOrgAdmin = auth.user?.role === UserRole.ORG_ADMIN;
  const canManageBrands = isSuper || isOrgAdmin;
  const isFirstBrand = auth.requiresBrandCreation;

  const loadBrands = useCallback(async () => {
    if (!auth.token) return;
    setLoading(true);
    try {
      if (isSuper) {
        const res = await adminAPI.listBrands(auth.token);
        setBrands(res.data.brands);
      } else {
        const res = await organizationAPI.listBrands(auth.token);
        setBrands(res.data.brands);
      }
    } catch {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  }, [auth.token, isSuper]);

  // Auto-open modal for new orgs that haven't created a brand yet
  useEffect(() => {
    if (!auth.isLoading && isFirstBrand) {
      setShowCreate(true);
    }
  }, [auth.isLoading, isFirstBrand]);

  useEffect(() => {
    if (auth.token && !auth.isLoading) loadBrands();
  }, [auth.token, auth.isLoading, loadBrands]);

  const handleBrandCreated = useCallback(async (brand: Brand) => {
    if (isFirstBrand) {
      try {
        await auth.switchBrand(brand.id);
        router.push('/content');
      } catch {
        toast.error('Brand created but failed to switch. Please refresh.');
      }
    } else {
      setShowCreate(false);
      loadBrands();
    }
  }, [isFirstBrand, auth, router, loadBrands]);

  const handleBrandSaved = useCallback((updated: Brand) => {
    setBrands(prev => prev.map(b => b.id === updated.id ? updated : b));
  }, []);

  const handleSwitchBrand = useCallback(async (brand: Brand) => {
    if (brand.id === auth.brand?.id) return;
    setSwitching(brand.id);
    try {
      await auth.switchBrand(brand.id);
      router.push('/content');
    } catch {
      toast.error('Failed to switch brand');
      setSwitching(null);
    }
  }, [auth, router]);

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-7 w-7 animate-spin text-purple-400" />
      </div>
    );
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
            <p className="text-sm text-white/40">{brands.length} brand{brands.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {canManageBrands && !isFirstBrand && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Brand
          </button>
        )}
      </div>

      {/* Brands grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-purple-400" />
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium text-white/40 mb-1">No brands yet</p>
          {canManageBrands && (
            <p className="text-sm text-white/25">Create your first brand to get started.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map(brand => {
            const isActive = brand.id === auth.brand?.id;
            const isSwitching = switching === brand.id;
            return (
              <div
                key={brand.id}
                className={`group relative bg-white/[0.03] border rounded-xl p-5 transition-all
                  ${isActive ? 'border-violet-500/50 bg-violet-500/10' : 'border-white/8'}`}
              >
                {/* Edit button — top-right, visible on hover for org admins */}
                {canManageBrands && !isSuper && (
                  <button
                    onClick={() => setEditingBrand(brand)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-white/0 group-hover:text-white/40 hover:!text-white hover:bg-white/8 transition-all"
                    title="Edit brand"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* Card body — clickable to switch brand */}
                <button
                  onClick={() => !isSuper && handleSwitchBrand(brand)}
                  disabled={isSwitching || isActive || isSuper}
                  className={`w-full text-left ${!isSuper && !isActive ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-600/20 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-purple-300">{brand.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold truncate">{brand.name}</p>
                        {isActive && (
                          <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-violet-300 bg-violet-500/20 px-1.5 py-0.5 rounded uppercase tracking-wide">
                            <Check className="h-2.5 w-2.5" />
                            Active
                          </span>
                        )}
                      </div>
                      {brand.industry && (
                        <p className="text-white/40 text-xs mt-0.5">{brand.industry}</p>
                      )}
                    </div>
                    {isSwitching && <Loader2 className="h-4 w-4 animate-spin text-purple-400 shrink-0 mt-0.5" />}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/40">
                    {brand.website && (
                      <span
                        role="link"
                        onClick={e => { e.stopPropagation(); window.open(brand.website, '_blank', 'noreferrer'); }}
                        className="flex items-center gap-1 hover:text-white/70 transition-colors cursor-pointer"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Website
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-[11px] text-white/20">
                    Created {new Date(brand.created_at).toLocaleDateString()}
                  </p>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateBrandModal
          token={auth.token!}
          onClose={() => setShowCreate(false)}
          onCreated={handleBrandCreated}
          isFirstBrand={isFirstBrand}
        />
      )}

      {editingBrand && (
        <EditBrandModal
          brand={editingBrand}
          token={auth.token!}
          onClose={() => setEditingBrand(null)}
          onSaved={handleBrandSaved}
        />
      )}
    </div>
  );
}
