import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
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

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  file_url?: string;
  external_url?: string;
  theme_id: string;
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const loadResources = async () => {
    try {
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('resources')
        .select(`
          id,
          title,
          type,
          tags,
          theme:themes(title)
        `);

      if (resourcesError) throw resourcesError;

      const summaries: ResourceSummary[] = (resourcesData || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        theme: r.theme?.title || 'Non catégorisé',
        type: r.type,
        keywords: r.tags || []
      }));

      setResources(summaries);
      setLoadError(false);
    } catch (error) {
      console.error('Error loading resources:', error);
      setLoadError(true);
    }
  };

  const handleOpen = async () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Bonjour ! Je suis l'assistant SecuriCoach. Posez-moi une question sur la cybersécurité ou dites-moi ce que vous cherchez — je vous guiderai vers les ressources les plus adaptées."
      }]);
    }
    if (resources.length === 0 && !loadError) {
      await loadResources();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const buildSystemPrompt = (): string => {
    const resourcesList = resources
      .map(r => `[${r.id}] | [${r.title}] | [${r.theme}] | [${r.type}] | [${r.keywords.join(', ')}]`)
      .join('\n');

    return `Tu es l'assistant de SecuriCoach, un outil gratuit de sensibilisation à la cybersécurité conçu par Serge Houtain, fondateur de beForensic et ancien enquêteur à l'Unité Régionale de Criminalité Informatique (RCCU) de la Police Judiciaire Fédérale belge.

Ton rôle est double :
1. Aider les utilisateurs à trouver les ressources les plus adaptées à leur situation parmi la bibliothèque SecuriCoach.
2. Répondre à leurs questions générales sur la cybersécurité de façon claire, accessible et sans jargon technique.

TON ET STYLE
- Professionnel mais humain.
- Tu t'adresses à des indépendants, professions libérales et dirigeants de PME belges, pas à des techniciens.
- Phrases courtes, vocabulaire accessible.
- Tu emploies "vous" systématiquement.
- Maximum 4-5 phrases par réponse sauf si l'utilisateur demande une explication détaillée.

FORMATAGE DES RÉPONSES
- Ne jamais utiliser de formatage Markdown dans tes réponses (pas de **, pas de *, pas de #, pas de -).
- Utilise uniquement du texte brut.
- Pour les listes, utilise des numéros (1. 2. 3.) ou des tirets simples sans astérisques.
- Tu peux utiliser des sauts de ligne pour séparer les paragraphes ou les éléments de liste.

RECOMMANDATION DE RESSOURCES
Tu as accès ci-dessous à la liste des ressources disponibles dans SecuriCoach (ID, titre, thème, type, mots-clés).
Lorsqu'une ressource est pertinente, mentionne son titre et son thème. Ne recommande jamais plus de 3 ressources à la fois.
Quand tu recommandes une ressource de la bibliothèque, utilise ce format : [RESSOURCE:ID] en remplaçant ID par l'identifiant numérique exact de la ressource. N'affiche que le titre dans le texte, mais transmets l'ID dans la balise. N'utilise ce format que pour les ressources qui existent réellement dans la liste fournie.

VOICI LA BIBLIOTHÈQUE :
${resourcesList}

LIMITES ET SUJETS SENSIBLES
- Questions juridiques : tu peux donner des informations générales à titre informatif, mais précise toujours : "Ces informations sont données à titre indicatif et n'engagent pas la responsabilité de beForensic. Pour toute situation spécifique, consultez un professionnel du droit."
- Incidents en cours : ne commente pas les cyberattaques ou incidents récents. Réponds : "Je ne commente pas les incidents en cours, mais je peux vous aider à mieux vous préparer à ce type de situation."
- Concurrents : réponds factuellement sur SecuriCoach sans dénigrer d'autres services.
- Hors périmètre : si la question n'a aucun lien avec la cybersécurité, indique poliment que tu es spécialisé dans ce domaine.

LANGUE
Tu réponds toujours en français, quelle que soit la langue utilisée par l'utilisateur.`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (loadError) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Je rencontre un problème technique. Veuillez réessayer dans quelques instants."
      }]);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const systemPrompt = resources.length > 0
        ? buildSystemPrompt()
        : "Tu es l'assistant de SecuriCoach, un outil gratuit de sensibilisation à la cybersécurité. Tu réponds en français de manière accessible et professionnelle.";

      const conversationHistory = messages
        .filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0)
        .map(m => ({ role: m.role, content: m.content }));

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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Chat API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage = data.message || "Je n'arrive pas à répondre pour le moment. Veuillez réessayer.";

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantMessage
      }]);

      logChatInteraction(userMessage, assistantMessage);
    } catch (error) {
      console.error('Error calling chat API:', error);
      const errorMessage = "Je n'arrive pas à répondre pour le moment. Veuillez réessayer.";
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const extractResourceIds = (content: string): string[] => {
    const regex = /\[RESSOURCE:\s*([^\]]+)\]/g;
    const ids: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      ids.push(match[1].trim());
    }
    return ids;
  };

  const logChatInteraction = async (question: string, response: string) => {
    try {
      const resourceIds = extractResourceIds(response);
      console.log('IDs extraits :', resourceIds);

      const cleanResponse = response.replace(/\[RESSOURCE:\s*([^\]]+)\]/g, (_, id) => {
        const resourceObj = resources.find(r => r.id === id.trim());
        return resourceObj?.title || id;
      });

      const { error } = await supabase
        .from('chat_logs')
        .insert({
          session_id: sessionId,
          question: question,
          reponse: cleanResponse,
          ressources_ids: resourceIds
        });

      if (error) {
        console.error('Erreur lors de l\'archivage:', error);
      }
    } catch (error) {
      console.error('Exception lors de l\'archivage:', error);
    }
  };

  const handleResourceClick = async (resourceId: string) => {
    console.log('ID recherché :', resourceId);
    setResourceError(null);

    try {
      const { data: resource, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', resourceId)
        .maybeSingle();

      console.log('Résultat Supabase :', resource);

      if (error) throw error;

      if (resource) {
        console.log('Ressource trouvée:', resource);
        if (!resource.url || resource.url.trim() === '') {
          console.log('URL manquante pour la ressource');
          setResourceError(resourceId);
          setTimeout(() => setResourceError(null), 5000);
          return;
        }
        window.open(resource.url, '_blank', 'noopener,noreferrer');
      } else {
        console.log('Ressource non trouvée pour l\'ID :', resourceId);
        setResourceError(resourceId);
        setTimeout(() => setResourceError(null), 5000);
      }
    } catch (error) {
      console.error('Error opening resource:', error);
      setResourceError(resourceId);
      setTimeout(() => setResourceError(null), 5000);
    }
  };

  const parseMessageWithResources = (content: string) => {
    const parts = [];
    const regex = /\[RESSOURCE:\s*([^\]]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }

      parts.push({
        type: 'resource',
        content: match[1].trim()
      });

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content }];
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed z-50 flex items-center gap-3 rounded-full hover:shadow-xl transition-all duration-200 text-white font-bold"
        style={{
          backgroundColor: '#E8650A',
          bottom: '80px',
          right: '24px',
          minHeight: '52px',
          paddingLeft: '20px',
          paddingRight: '20px',
          borderRadius: '999px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden sm:inline">Demander à l'assistant</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={handleClose}
          />

          <div className="fixed top-0 right-0 h-full w-full md:w-[380px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200" style={{ backgroundColor: '#E8650A' }}>
              <div className="text-white">
                <h2 className="text-xl font-semibold">Assistant SecuriCoach</h2>
                <p className="text-sm text-white/90">Posez votre question sur la cybersécurité</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div
              ref={messagesContainerRef}
              className="p-4 space-y-4"
              style={{
                height: 'calc(100vh - 140px - 80px - 70px)',
                overflowY: 'scroll',
                overscrollBehavior: 'contain'
              }}
            >
              {messages.map((message, index) => {
                const messageParts = message.role === 'assistant'
                  ? parseMessageWithResources(message.content)
                  : [{ type: 'text', content: message.content }];

                return (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-orange-50 text-slate-900 rounded-br-sm'
                          : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {messageParts.map((part, partIndex) => {
                          if (part.type === 'resource') {
                            const resourceId = part.content;
                            const resourceObj = resources.find(r => r.id === resourceId);
                            const displayTitle = resourceObj?.title || resourceId;

                            return (
                              <span key={partIndex}>
                                <button
                                  onClick={() => handleResourceClick(resourceId)}
                                  className="text-orange-600 underline hover:text-orange-700 cursor-pointer font-medium"
                                >
                                  {displayTitle}
                                </button>
                                {resourceError === resourceId && (
                                  <span className="block text-xs text-red-600 mt-1">
                                    Ressource introuvable — utilisez la recherche dans la bibliothèque.
                                  </span>
                                )}
                              </span>
                            );
                          }
                          return <span key={partIndex}>{part.content}</span>;
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-slate-100 text-slate-900 rounded-bl-sm">
                    <p className="text-sm leading-relaxed">
                      Je recherche dans la bibliothèque
                      <span className="inline-block animate-pulse">...</span>
                    </p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="sticky bottom-0 left-0 right-0 border-t border-slate-200 p-4 bg-white z-10">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Votre question..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#E8650A' }}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
