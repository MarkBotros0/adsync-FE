'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI, invitationAPI } from '@/lib/api';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import { toast } from 'sonner';
import { UserCheck, Plus, Mail, Shield, Loader2, X, Clock, Trash2 } from 'lucide-react';
import { type User, type Invitation, UserRole } from '@/lib/types';
import { AxiosError } from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function getApiError(err: unknown, fallback: string): string {
  return (err as AxiosError<{ detail?: string }>)?.response?.data?.detail ?? fallback;
}

const ROLE_BADGE: Record<string, { label: string; classes: string }> = {
  ORG_ADMIN: { label: 'Admin',  classes: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
  ADMIN:     { label: 'Admin',  classes: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
  NORMAL:    { label: 'Member', classes: 'bg-white/10 text-white/50 border border-white/10' },
};

function RoleBadge({ role }: { role: UserRole }) {
  if (role === UserRole.SUPER) return null;
  const b = ROLE_BADGE[role] ?? ROLE_BADGE.NORMAL;
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${b.classes}`}>{b.label}</span>;
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

function InviteModal({
  brandId,
  onClose,
  onSent,
  token,
}: {
  brandId: number;
  onClose: () => void;
  onSent: () => void;
  token: string;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole.NORMAL | UserRole.ORG_ADMIN>(UserRole.NORMAL);
  const [loading, setLoading] = useState(false);

  const isOrgAdminInvite = role === UserRole.ORG_ADMIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await invitationAPI.invite(token, {
        email,
        role,
        ...(isOrgAdminInvite ? {} : { brand_id: brandId }),
      });
      toast.success(`Invitation sent to ${email}`);
      onSent();
      onClose();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to send invitation'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-[#1a1a28] border border-white/10 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">Invite Team Member</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Email address</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Role</label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole.NORMAL | UserRole.ORG_ADMIN)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.NORMAL}>Member — access to current brand only</SelectItem>
                <SelectItem value={UserRole.ORG_ADMIN}>Admin — access to all brands</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isOrgAdminInvite && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5 text-xs text-amber-300/80">
              This person will have admin access to all brands in your organization.
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="mt-2 w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Send Invitation
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const auth = useBrandAuthContext();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Guard: ADMIN only
  useEffect(() => {
    if (auth.isLoading) return;
    if (auth.user?.role === UserRole.SUPER) router.replace('/users');
    else if (auth.user?.role === UserRole.NORMAL) router.replace('/content');
  }, [auth.isLoading, auth.user, router]);

  const loadTeam = useCallback(async () => {
    if (!auth.token || !auth.user?.brand?.id) return;
    setLoading(true);
    try {
      const res = await adminAPI.listBrandUsers(auth.token, auth.user.brand.id);
      setUsers(res.data.users.filter((u: User) => u.id !== auth.user!.id));
    } catch {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }

    try {
      const invRes = await adminAPI.listBrandInvitations(auth.token, auth.user.brand.id);
      setInvitations(invRes.data.invitations);
    } catch {
      toast.error('Failed to load invitations');
    }
  }, [auth.token, auth.user?.brand?.id]);

  useEffect(() => {
    if (auth.token && !auth.isLoading && (auth.user?.role === UserRole.ADMIN || auth.user?.role === UserRole.ORG_ADMIN)) loadTeam();
  }, [auth.token, auth.isLoading, auth.user?.role, loadTeam]);

  const handleDeleteInvitation = async (id: number) => {
    if (!auth.token) return;
    setDeletingId(id);
    try {
      await invitationAPI.delete(auth.token, id);
      setInvitations(prev => prev.filter(inv => inv.id !== id));
      toast.success('Invitation deleted');
    } catch (err) {
      toast.error(getApiError(err, 'Failed to delete invitation'));
    } finally {
      setDeletingId(null);
    }
  };

  if (!mounted || auth.isLoading || (auth.user?.role !== UserRole.ADMIN && auth.user?.role !== UserRole.ORG_ADMIN)) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-7 w-7 animate-spin text-purple-400" /></div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Team</h1>
            <p className="text-sm text-white/40">{users.length} member{users.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Invite Member
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-purple-400" />
        </div>
      ) : (
        <>
          {/* Team table */}
          {users.length === 0 && invitations.length === 0 ? (
            <div className="text-center py-20 text-white/30">
              <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No team members yet. Invite someone to get started.</p>
            </div>
          ) : users.length > 0 ? (
            <div className="bg-white/[0.03] border border-white/8 rounded-xl overflow-hidden mb-8">

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wide">Member</th>
                    <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wide">Role</th>
                    <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wide hidden lg:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-purple-600/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-purple-300">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium flex items-center gap-2">
                              {user.name}
                              {user.id === auth.user?.id && (
                                <span className="text-[10px] text-white/30">(you)</span>
                              )}
                            </p>
                            <p className="text-white/40 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <RoleBadge role={user.role} />
                          {user.role === UserRole.ADMIN && (
                            <Shield className="h-3.5 w-3.5 text-purple-400/50" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-white/40">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Invitations ({invitations.length})
              </h2>
              <div className="bg-white/[0.03] border border-white/8 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wide">Email</th>
                      <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wide">Role</th>
                      <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wide hidden lg:table-cell">Expires</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {invitations.map(inv => (
                      <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-white/30 shrink-0" />
                            <span className="text-white/70">{inv.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <RoleBadge role={inv.role} />
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-white/40">
                          {new Date(inv.expires_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteInvitation(inv.id)}
                            disabled={deletingId === inv.id}
                            className="text-white/30 hover:text-red-400 transition-colors disabled:opacity-40"
                            aria-label="Delete invitation"
                          >
                            {deletingId === inv.id
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <Trash2 className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {showInvite && auth.user && (
        <InviteModal
          brandId={auth.user.brand?.id ?? 0}
          token={auth.token!}
          onClose={() => setShowInvite(false)}
          onSent={loadTeam}
        />
      )}
    </div>
  );
}
