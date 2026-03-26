'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Building2, Plus, Check, Loader2 } from 'lucide-react';
import { brandAuthAPI } from '@/lib/api';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import { UserRole, type BrandSwitcherEntry } from '@/lib/types';
import { toast } from 'sonner';

interface BrandSwitcherProps {
  isCollapsed: boolean;
  onClose?: () => void;
}

export function BrandSwitcher({ isCollapsed, onClose }: BrandSwitcherProps) {
  const auth = useBrandAuthContext();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [brands, setBrands] = useState<BrandSwitcherEntry[]>([]);
  const [switching, setSwitching] = useState(false);

  const loadBrands = useCallback(async () => {
    if (!auth.token) return;
    try {
      const res = await brandAuthAPI.myBrands(auth.token);
      setBrands(res.data.brands);
    } catch {
      // silently fail — switcher will just show current brand
    }
  }, [auth.token]);

  useEffect(() => {
    if (auth.isAuthenticated) loadBrands();
  }, [auth.isAuthenticated, loadBrands]);

  // Reload brands list after switching (new brand may have been created)
  useEffect(() => {
    if (auth.brand) loadBrands();
  }, [auth.brand?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSwitch = async (brand: BrandSwitcherEntry) => {
    if (brand.id === auth.brand?.id) { setOpen(false); return; }
    setSwitching(true);
    try {
      await auth.switchBrand(brand.id);
      setOpen(false);
      onClose?.();
      router.push('/content');
    } catch {
      toast.error('Failed to switch brand');
    } finally {
      setSwitching(false);
    }
  };

  const currentBrandName = auth.brand?.name ?? auth.user?.org_name ?? 'AdSync';
  const isOrgAdmin = auth.user?.role === UserRole.ORG_ADMIN || auth.user?.role === UserRole.SUPER;
  const canCreateBrand = isOrgAdmin;

  if (isCollapsed) {
    return (
      <div className="flex justify-center px-2 py-2">
        <div className="h-8 w-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
          <span className="text-xs font-bold text-purple-300">
            {currentBrandName.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 bg-white/6 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
      >
        <div className="h-6 w-6 rounded-md bg-purple-600/30 flex items-center justify-center shrink-0">
          <span className="text-[11px] font-bold text-purple-300">
            {currentBrandName.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="flex-1 text-left text-white font-semibold text-sm truncate">
          {currentBrandName}
        </span>
        {switching
          ? <Loader2 className="h-3.5 w-3.5 text-slate-400 animate-spin shrink-0" />
          : <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        }
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-[#1a1a28] border border-white/10 rounded-xl shadow-xl overflow-hidden">
            {brands.length > 0 && (
              <div className="py-1 max-h-52 overflow-y-auto">
                {brands.map(brand => (
                  <button
                    key={brand.id}
                    onClick={() => handleSwitch(brand)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors
                      ${brand.id === auth.brand?.id
                        ? 'text-white bg-violet-500/15'
                        : 'text-slate-300 hover:text-white hover:bg-white/6'}`}
                  >
                    <div className="h-5 w-5 rounded bg-purple-600/20 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-purple-300">
                        {brand.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="flex-1 truncate text-left">{brand.name}</span>
                    {brand.id === auth.brand?.id && (
                      <Check className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {canCreateBrand && (
              <>
                {brands.length > 0 && <div className="border-t border-white/8" />}
                <button
                  onClick={() => { setOpen(false); onClose?.(); router.push('/brands'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/6 transition-colors"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span>New brand</span>
                </button>
              </>
            )}

            {brands.length === 0 && !canCreateBrand && (
              <div className="px-3 py-3 text-xs text-white/30 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                No brands available
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
