import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ResourceSummary {
  id: string;
  title: string;
  theme: string;
  type: string;
  keywords: string[];
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [resourceError, setResourceError] = useState<string | null>(null);
  const [sessionId] = useState<string>(() => crypto.randomUUID());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (inputRef.current) inputRef.current.focus();
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const loadResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select(`id, title, type, tags, theme:themes(title)`);

      if (error) throw error;

      const summaries: ResourceSummary[] = (data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        theme: r.theme?.title || 'Non catégorisé',
        type: r.type,
        keywords: r.tags || []
      }));

      setResources(summaries);
      setLoadError(false);
    } catch (error) {
      console.error('ChatBot: Error loading resources:', error);
      setLoadError(true);
    }
  };

  const handleOpen = async () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Bonjour ! Je suis l'assistant CyberKit. Posez-moi une question sur la cybersécurité ou dites-moi ce que vous cherchez — je vous guiderai vers les ressources les plus adaptées."
      }]);
    }
    if (resources.length === 0 && !loadError) {
      await loadResources();
    }
  };

  const buildSystemPrompt = (): string => {
    // On limite à 40 ressources max pour éviter de faire planter l'IA si la liste est trop longue
    const resourcesList = resources
      .slice(0, 50)
      .map(r => `[${r.id}] | [${r.title}] | [${r.theme}] | [${r.type}]`)
      .join('\n');

    return `Tu es l'assistant de CyberKit, un outil gratuit de sensibilisation à la cybersécurité conçu par Serge Houtain, fondateur de beForensic et ancien enquêteur à la Police Judiciaire Fédérale belge (RCCU).

TON RÔLE :
1. Aider les utilisateurs à trouver des ressources adaptées dans la bibliothèque CyberKit ci-dessous.
2. Répondre aux questions de manière claire, sans jargon technique.

STYLE :
- Professionnel, bienveillant, utilise "vous".
- Phrases courtes (max 4 par réponse).
- Pas de gras (**), pas de titres (#). Uniquement du texte brut.

RECOMMANDATIONS :
Si une ressource est pertinente, utilise EXACTEMENT ce format : [RESSOURCE:ID].
Exemple : "Je vous conseille de lire [RESSOURCE:123]"

BIBLIOTHÈQUE DISPONIBLE :
${resourcesList}

IMPORTANT : Si la question est juridique, ajoute : "Ces informations sont données à titre indicatif et n'engagent pas la responsabilité de beForensic. Consultez un professionnel du droit."`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const systemPrompt = buildSystemPrompt();
      const conversationHistory = messages.map(m => ({ role: m.role, content: m.content }));
      conversationHistory.push({ role: 'user', content: userMessage });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemPrompt,
            messages: conversationHistory,
          }),
        }
      );

      if (!response.ok) throw new Error('Erreur réseau ou API');

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || "Je peux vous aider sur un autre sujet ?"
      }]);

    } catch (error) {
      console.error('ChatBot Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Désolé, je rencontre une petite difficulté technique. Pouvez-vous reformuler votre question ?"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResourceClick = async (resourceId: string) => {
    try {
      const { data } = await supabase.from('resources').select('url').eq('id', resourceId).single();
      if (data?.url) window.open(data.url, '_blank');
      else setResourceError(resourceId);
    } catch {
      setResourceError(resourceId);
    }
  };

  const parseMessage = (content: string) => {
    const parts = [];
    const regex = /\[RESSOURCE:\s*([^\]]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) parts.push({ type: 'text', content: content.substring(lastIndex, match.index) });
      parts.push({ type: 'resource', id: match[1].trim() });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < content.length) parts.push({ type: 'text', content: content.substring(lastIndex) });
    return parts;
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed z-50 flex items-center gap-3 rounded-full shadow-lg text-white font-bold px-6 py-4 hover:scale-105 transition-all"
        style={{ backgroundColor: '#E8650A', bottom: '100px', right: '24px' }}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden sm:inline">Aide Cyber</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[400px] md:h-[600px] bg-white shadow-2xl z-[60] flex flex-col md:rounded-3xl overflow-hidden border border-slate-200">
          <div className="p-5 flex items-center justify-between text-white" style={{ backgroundColor: '#E8650A' }}>
            <div>
              <h2 className="font-bold">Assistant CyberKit</h2>
              <p className="text-xs opacity-90">Expert en sensibilisation</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-[#E8650A] text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                  {parseMessage(m.content).map((part, pi) => (
                    part.type === 'resource' ? (
                      <button key={pi} onClick={() => handleResourceClick(part.id)} className="block mt-2 p-2 bg-orange-50 text-[#E8650A] rounded-lg border border-orange-100 font-bold hover:bg-orange-100 transition-colors">
                        Voir la ressource suggérée
                      </button>
                    ) : <span key={pi}>{part.content}</span>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-xs text-slate-400 animate-pulse">L'assistant réfléchit...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Posez votre question..."
              className="flex-1 text-sm p-3 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-3 bg-[#E8650A] text-white rounded-xl disabled:opacity-50">
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}