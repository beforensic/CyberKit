import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Mail, Loader, Search, Inbox, MessageCircle,
  ExternalLink, RefreshCw, Trash2, Archive, ArchiveRestore,
} from 'lucide-react';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  quiz_score: number | null;
  theme_interest: string | null;
  created_at: string;
  archived_at: string | null;
  status: 'new' | 'read' | 'replied';
}

type StatusFilter = 'all' | ContactMessage['status'];
type InboxView = 'active' | 'archived';

const STATUS_LABELS: Record<ContactMessage['status'], string> = {
  new: 'Nouveau',
  read: 'Lu',
  replied: 'Répondu',
};

const STATUS_STYLES: Record<ContactMessage['status'], string> = {
  new: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  read: 'bg-blue-50 text-blue-700 border-blue-100',
  replied: 'bg-slate-100 text-slate-600 border-slate-200',
};

const VALID_STATUS = new Set<ContactMessage['status']>(['new', 'read', 'replied']);

function normalizeMessage(row: Record<string, unknown>): ContactMessage {
  const status = VALID_STATUS.has(row.status as ContactMessage['status'])
    ? (row.status as ContactMessage['status'])
    : 'new';
  const archivedAt =
    typeof row.archived_at === 'string' ? row.archived_at : null;
  return { ...row, status, archived_at: archivedAt } as ContactMessage;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-BE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface ContactMessagesPanelProps {
  onMessageCountChange?: (newCount: number) => void;
}

export default function ContactMessagesPanel({
  onMessageCountChange,
}: ContactMessagesPanelProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [inboxView, setInboxView] = useState<InboxView>('active');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const notifyNewCount = useCallback(
    (rows: ContactMessage[]) => {
      onMessageCountChange?.(
        rows.filter(m => m.status === 'new' && !m.archived_at).length,
      );
    },
    [onMessageCountChange],
  );

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);

      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'admin_list_contact_messages',
        { p_archived: inboxView === 'archived' },
      );

      if (rpcError) throw rpcError;

      const rows = ((rpcData as Record<string, unknown>[]) ?? []).map(
        normalizeMessage,
      );

      if (rows.length === 0) {
        const { data: { session } } = await supabase.auth.getSession();
        const role =
          session?.user?.app_metadata?.role ??
          session?.user?.user_metadata?.role;
        if (role !== 'admin' && inboxView === 'active') {
          setLoadError(
            'Compte sans rôle admin. Exécutez grant_cyberkit_admin.sql avec votre email, puis déconnectez-vous et reconnectez-vous sur /admin.',
          );
          setMessages([]);
          return;
        }
      }

      setMessages(rows);
      if (inboxView === 'active') {
        notifyNewCount(rows);
      }
      setSelectedId(prev => {
        if (prev && rows.some(m => m.id === prev)) return prev;
        return rows[0]?.id ?? null;
      });
    } catch (err) {
      console.error('Erreur chargement messages:', err);
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setLoadError(
        `Impossible de charger les messages (${msg}). Vérifiez grant_cyberkit_admin.sql puis reconnectez-vous.`,
      );
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [inboxView, notifyNewCount]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const removeFromList = (id: string) => {
    setMessages(prev => {
      const next = prev.filter(m => m.id !== id);
      if (inboxView === 'active') notifyNewCount(next);
      return next;
    });
    setSelectedId(current => (current === id ? null : current));
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Archiver ce message ? Il restera en base mais hors de la boîte active.')) {
      return;
    }
    try {
      setMutating(true);
      const { error } = await supabase.rpc('admin_archive_contact_message', {
        p_message_id: id,
      });
      if (error) throw error;
      removeFromList(id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      alert('Archivage impossible : ' + msg);
    } finally {
      setMutating(false);
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      setMutating(true);
      const { error } = await supabase.rpc('admin_unarchive_contact_message', {
        p_message_id: id,
      });
      if (error) throw error;
      removeFromList(id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      alert('Restauration impossible : ' + msg);
    } finally {
      setMutating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Supprimer définitivement ce message archivé ? Cette action est irréversible.',
      )
    ) {
      return;
    }
    try {
      setMutating(true);
      const { error } = await supabase.rpc('admin_delete_contact_message', {
        p_message_id: id,
      });
      if (error) throw error;
      removeFromList(id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      alert('Suppression impossible : ' + msg);
    } finally {
      setMutating(false);
    }
  };

  const updateStatus = async (id: string, status: ContactMessage['status']) => {
    try {
      setMutating(true);
      const { error } = await supabase.rpc(
        'admin_update_contact_message_status',
        { p_message_id: id, p_status: status },
      );

      if (error) throw error;

      setMessages(prev => {
        const next = prev.map(m => (m.id === id ? { ...m, status } : m));
        notifyNewCount(next);
        return next;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      alert('Mise à jour impossible : ' + msg);
    } finally {
      setMutating(false);
    }
  };

  const filtered = messages.filter(m => {
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const selected = messages.find(m => m.id === selectedId) ?? filtered[0] ?? null;
  const newCount = messages.filter(m => m.status === 'new').length;
  const isArchivedView = inboxView === 'archived';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader className="w-8 h-8 text-brand-orange animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <Inbox className="w-5 h-5 text-brand-orange" />
          <span className="font-bold text-slate-700">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
            {isArchivedView ? ' archivé' : ''}
            {messages.length !== 1 && isArchivedView ? 's' : ''}
            {!isArchivedView && newCount > 0 && (
              <span className="ml-2 text-xs font-black px-2 py-0.5 rounded-full bg-brand-orange text-white">
                {newCount} nouveau{newCount > 1 ? 'x' : ''}
              </span>
            )}
          </span>
        </div>
        <button
          type="button"
          onClick={loadMessages}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-orange transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      <div className="px-6 pt-4 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setInboxView('active');
            setStatusFilter('all');
            setSelectedId(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            inboxView === 'active'
              ? 'bg-brand-orange text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Boîte active
        </button>
        <button
          type="button"
          onClick={() => {
            setInboxView('archived');
            setStatusFilter('all');
            setSelectedId(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            inboxView === 'archived'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Archivés
        </button>
      </div>

      <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher nom, email, sujet..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-orange/20 font-medium text-sm"
          />
        </div>
        {!isArchivedView && (
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as StatusFilter)}
            className="bg-slate-50 border-none px-5 py-3 rounded-2xl text-sm font-bold text-slate-600 cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="new">Nouveaux</option>
            <option value="read">Lus</option>
            <option value="replied">Répondus</option>
          </select>
        )}
      </div>

      {loadError ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-8 text-center">
          <Mail className="w-12 h-12 mb-4 text-red-300" />
          <p className="font-bold text-slate-800 mb-2">Chargement impossible</p>
          <p className="text-sm text-slate-600 max-w-md leading-relaxed">{loadError}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
          <Mail className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-medium">
            {messages.length === 0
              ? isArchivedView
                ? 'Aucun message archivé.'
                : 'Aucun message en base.'
              : 'Aucun message pour ce filtre.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col lg:flex-row min-h-0">
          <ul className="lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-100 overflow-y-auto max-h-[280px] lg:max-h-none lg:max-h-[520px]">
            {filtered.map(m => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  className={`w-full text-left p-4 border-b border-slate-50 transition-colors ${
                    selected?.id === m.id
                      ? 'bg-brand-orange/5 border-l-4 border-l-brand-orange'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm truncate">
                      {m.name}
                    </span>
                    {!isArchivedView && (
                      <span
                        className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[m.status]}`}
                      >
                        {STATUS_LABELS[m.status]}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{m.subject}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formatDate(
                      isArchivedView && m.archived_at
                        ? m.archived_at
                        : m.created_at,
                    )}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          {selected && (
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-1">
                    {selected.subject}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Reçu le {formatDate(selected.created_at)}
                  </p>
                  {isArchivedView && selected.archived_at && (
                    <p className="text-sm text-slate-400 mt-0.5">
                      Archivé le {formatDate(selected.archived_at)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {!isArchivedView && (
                    <>
                      {selected.status !== 'read' && (
                        <button
                          type="button"
                          disabled={mutating}
                          onClick={() => updateStatus(selected.id, 'read')}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                        >
                          Marquer lu
                        </button>
                      )}
                      {selected.status !== 'replied' && (
                        <button
                          type="button"
                          disabled={mutating}
                          onClick={() => updateStatus(selected.id, 'replied')}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                        >
                          Marquer répondu
                        </button>
                      )}
                      {selected.status !== 'new' && (
                        <button
                          type="button"
                          disabled={mutating}
                          onClick={() => updateStatus(selected.id, 'new')}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-brand-orange hover:bg-brand-orange/10 disabled:opacity-50"
                        >
                          Nouveau
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={mutating}
                        onClick={() => handleArchive(selected.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                        title="Archiver le message"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        Archiver
                      </button>
                    </>
                  )}
                  {isArchivedView && (
                    <>
                      <button
                        type="button"
                        disabled={mutating}
                        onClick={() => handleUnarchive(selected.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                      >
                        <ArchiveRestore className="w-3.5 h-3.5" />
                        Restaurer
                      </button>
                      <button
                        type="button"
                        disabled={mutating}
                        onClick={() => handleDelete(selected.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        title="Suppression définitive (RGPD)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Supprimer définitivement
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Expéditeur
                  </p>
                  <p className="font-bold text-slate-900">{selected.name}</p>
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                    className="text-sm text-brand-orange font-medium hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    {selected.email}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {(selected.quiz_score != null || selected.theme_interest) && (
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Contexte diagnostic
                    </p>
                    {selected.quiz_score != null && (
                      <p className="text-sm font-bold text-slate-800">
                        Score : {selected.quiz_score}%
                      </p>
                    )}
                    {selected.theme_interest && (
                      <p className="text-sm text-slate-600 mt-1">
                        {selected.theme_interest}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Message
                </p>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>

              {!isArchivedView && (
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}&body=${encodeURIComponent(`Bonjour ${selected.name},\n\n`)}`}
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-brand-orange text-white rounded-2xl font-bold text-sm hover:bg-brand-orange-600 transition-colors"
                >
                  <Mail className="w-4 h-4" /> Répondre par email
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Nombre de messages « new » actifs pour badge nav admin. */
export async function fetchNewContactCount(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('admin_list_contact_messages', {
      p_archived: false,
    });
    if (error) return 0;
    const rows = ((data as Record<string, unknown>[]) ?? []).map(normalizeMessage);
    return rows.filter(m => m.status === 'new').length;
  } catch {
    return 0;
  }
}
