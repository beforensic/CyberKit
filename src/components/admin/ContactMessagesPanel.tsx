import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Mail, Loader, Search, Inbox, MessageCircle,
  ExternalLink, RefreshCw,
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
  status: 'new' | 'read' | 'replied';
}

type StatusFilter = 'all' | ContactMessage['status'];

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
  return { ...row, status } as ContactMessage;
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

export default function ContactMessagesPanel() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);

      const { data, error } = await supabase.functions.invoke(
        'admin-contact-messages',
        { body: {} },
      );

      if (error) throw error;
      if (data?.error) {
        setLoadError(data.error);
        setMessages([]);
        return;
      }

      const rows = ((data?.messages as Record<string, unknown>[]) ?? []).map(
        normalizeMessage,
      );
      setMessages(rows);
      setSelectedId(prev => prev ?? rows[0]?.id ?? null);
    } catch (err) {
      console.error('Erreur chargement messages:', err);
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setLoadError(
        `Impossible de charger les messages (${msg}). Déconnectez-vous puis reconnectez-vous sur /admin après avoir exécuté grant_cyberkit_admin.sql.`,
      );
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const updateStatus = async (id: string, status: ContactMessage['status']) => {
    try {
      setUpdating(true);
      const { data, error } = await supabase.functions.invoke(
        'admin-contact-messages',
        { body: { action: 'update', id, status } },
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setMessages(prev =>
        prev.map(m => (m.id === id ? { ...m, status } : m)),
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      alert('Mise à jour impossible : ' + msg);
    } finally {
      setUpdating(false);
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
            {newCount > 0 && (
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
              ? 'Aucun message en base.'
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
                    <span
                      className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[m.status]}`}
                    >
                      {STATUS_LABELS[m.status]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{m.subject}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formatDate(m.created_at)}
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
                    {formatDate(selected.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.status !== 'read' && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => updateStatus(selected.id, 'read')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                    >
                      Marquer lu
                    </button>
                  )}
                  {selected.status !== 'replied' && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => updateStatus(selected.id, 'replied')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                    >
                      Marquer répondu
                    </button>
                  )}
                  {selected.status !== 'new' && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => updateStatus(selected.id, 'new')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-brand-orange hover:bg-brand-orange/10 disabled:opacity-50"
                    >
                      Nouveau
                    </button>
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

              <a
                href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}&body=${encodeURIComponent(`Bonjour ${selected.name},\n\n`)}`}
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-brand-orange text-white rounded-2xl font-bold text-sm hover:bg-brand-orange-600 transition-colors"
              >
                <Mail className="w-4 h-4" /> Répondre par email
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Nombre de messages « new » pour badge nav admin (optionnel). */
export async function fetchNewContactCount(): Promise<number> {
  try {
    const { data, error } = await supabase.functions.invoke(
      'admin-contact-messages',
      { body: {} },
    );
    if (error || data?.error) return 0;
    const rows = (data?.messages as ContactMessage[]) ?? [];
    return rows.filter(m => (m.status ?? 'new') === 'new').length;
  } catch {
    return 0;
  }
}
