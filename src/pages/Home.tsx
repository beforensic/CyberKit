import { useState, useEffect } from 'react';
import { Shield, BookOpen, ChevronRight, Award, Activity, Lock, Search, ChevronDown } from 'lucide-react';
import { supabase, Theme, Resource } from '../lib/supabase';
import { getIconComponent } from '../utils/icons';
import { getScore } from '../utils/storage';
import GoogleReview from '../components/GoogleReview';

interface HomeProps {
  onNavigate: (page: 'home' | 'quiz' | 'resources' | 'admin' | 'about', filter?: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const scoreResult = getScore();
  const score = scoreResult?.score || 0;
  const hasScore = score > 0;
  const [searchTerm, setSearchTerm] = useState('');
  const [themes, setThemes] = useState<Theme[]>([]);
  const [randomResources, setRandomResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollIndicator(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: themesData, error: themesError } = await supabase
        .from('themes')
        .select('*')
        .order('title');

      if (themesError) throw themesError;

      const { data: resourcesData, error: resourcesError } = await supabase
        .from('resources')
        .select('*, themes(title)');

      if (resourcesError) throw resourcesError;

      setThemes(themesData || []);

      const shuffled = [...(resourcesData || [])].sort(() => Math.random() - 0.5);
      setRandomResources(shuffled.slice(0, 3));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = () => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700';
    if (score >= 50) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 pt-12 pb-16 md:pb-24 px-6 relative overflow-hidden min-h-[calc(100vh-80px)] md:min-h-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-700 opacity-20 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 border border-white/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-white text-4xl font-bold mb-3">Votre cybersécurité,<br />simplement.</h1>
          <p className="text-white/90 text-base max-w-md mx-auto leading-relaxed">CyberKit vous guide gratuitement, pas à pas, pour protéger votre activité en toute simplicité.</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-2xl transform translate-y-12 border border-slate-200 max-w-md mx-auto">
          {hasScore && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-slate-700 font-semibold flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-primary" />
                  Votre niveau de sécurité
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getScoreBg()}`}>
                  {score >= 80 ? 'Optimisé' : score >= 50 ? 'Moyen' : 'Risque Élevé'}
                </span>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-slate-100"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={201}
                      strokeDashoffset={201 - (201 * score) / 100}
                      className={score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-500'}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold text-slate-900">{score}</span>
                    <span className="text-[10px] text-slate-400 font-medium">/100</span>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-2 leading-tight">
                    {score < 50 ? "Plusieurs failles critiques détectées." : score < 80 ? "Vous êtes sur la bonne voie !" : "Bravo ! Votre sécurité est optimale."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!hasScore && (
            <div className="text-center mb-4">
              <p className="text-slate-600 text-sm leading-relaxed">Faites le point sur votre sécurité dès maintenant et découvrez comment mieux protéger votre activité.</p>
            </div>
          )}

          <button
            onClick={() => onNavigate('quiz')}
            className="w-full py-4 bg-accent hover:bg-accent-600 text-white text-base font-semibold rounded-2xl shadow-lg shadow-accent-200 active:scale-95 transition-all"
          >
            {!hasScore ? 'Démarrer le diagnostic' : score === 100 ? 'Maintenir mes réflexes' : 'Améliorer mon score'}
          </button>
        </div>

        {showScrollIndicator && (
          <div className="relative z-10 flex justify-center mt-16">
            <div className="flex flex-col items-center gap-1 animate-bounce">
              <ChevronDown className="w-8 h-8 text-white/70" />
              <ChevronDown className="w-8 h-8 text-white/70 -mt-4" />
            </div>
          </div>
        )}
      </div>

      <div className="h-12"></div>

      <div className="px-6 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par mots-clés..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-primary focus:outline-none text-slate-700 placeholder-slate-400 shadow-sm"
          />
        </div>
        {searchTerm && (
          <button
            onClick={() => onNavigate('resources')}
            className="w-full mt-3 py-3 bg-accent hover:bg-accent-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            Voir les résultats pour "{searchTerm}"
          </button>
        )}
      </div>

      <div className="px-6 mb-8">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#2D3748' }}>
          <Shield className="w-6 h-6 text-primary" />
          Thèmes
        </h3>
        {loading ? (
          <div className="text-center py-8 text-slate-500">Chargement...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {themes.map((theme) => {
              const IconComponent = getIconComponent(theme.icon_name);
              return (
                <button
                  key={theme.id}
                  onClick={() => onNavigate('resources', theme.title)}
                  className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg hover:bg-primary-50 hover:-translate-y-1 transition-all text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="font-bold text-slate-900 text-sm leading-tight">{theme.title}</div>
                  </div>
                  {theme.description && (
                    <div className="text-xs text-slate-500 line-clamp-2">{theme.description}</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#2D3748' }}>
            <BookOpen className="w-6 h-6 text-accent" />
            Pour commencer, pourquoi pas...
          </h3>
          <button
            onClick={() => onNavigate('resources')}
            className="text-sm text-primary font-semibold hover:text-primary-700 transition-colors"
          >
            Voir tout
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Chargement...</div>
        ) : (
          <div className="grid gap-3">
            {randomResources.map((resource) => (
              <div
                key={resource.id}
                onClick={() => window.open(resource.url, '_blank')}
                className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:bg-primary-50 hover:-translate-y-0.5 transition-all"
              >
                <div className={`p-3 rounded-xl ${resource.type === 'video' ? 'bg-sky-50 text-sky-600' :
                    resource.type === 'pdf' ? 'bg-slate-50 text-slate-900' :
                      resource.type === 'audio' ? 'bg-slate-50 text-slate-400' : 'bg-primary-50 text-primary'
                  }`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{resource.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {resource.themes?.title || 'Thème'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium capitalize">{resource.type}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 mt-12 pb-24 text-center bg-primary-50 py-8 rounded-t-3xl">
        <div className="mb-4 pb-4 border-b border-primary-100">
          <button
            onClick={() => onNavigate('company-signup')}
            className="inline-block bg-[#E8650A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d15809] transition-all shadow-md hover:shadow-lg"
          >
            Espace entreprise
          </button>
          <p className="text-xs text-slate-500 mt-2">
            Gérez la cybersécurité de votre équipe
          </p>
        </div>

        <p className="text-sm text-slate-600 mb-3">
          Un service offert par{' '}
          <a
            href="https://beforensic.be"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:text-primary-700 hover:underline transition-colors"
          >
            beForensic.be
          </a>
        </p>
        <div className="flex items-center justify-center gap-3 mb-3 text-xs text-slate-500">
          <button
            onClick={() => onNavigate('legal')}
            className="hover:text-primary hover:underline transition-colors"
          >
            Mentions Légales
          </button>
          <span>•</span>
          <button
            onClick={() => onNavigate('legal')}
            className="hover:text-primary hover:underline transition-colors"
          >
            Confidentialité
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-3">© 2026 beForensic - Tous droits réservés</p>
        <button
          onClick={() => onNavigate('admin')}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Administration
        </button>
      </div>
      <GoogleReview variant="banner" />
    </div>
  );
}
