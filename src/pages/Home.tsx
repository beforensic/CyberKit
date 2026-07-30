import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Lock, Activity, Sparkles, CheckCircle, ChevronRight } from 'lucide-react';
import { getIconComponent } from '../utils/icons';
import { getScore } from '../utils/storage';
import { useThemes } from '../hooks/useThemes';
import GoogleReview from '../components/GoogleReview';
import ContactCtaBanner from '../components/ContactCtaBanner';

export default function Home() {
  const navigate = useNavigate();
  const { themes } = useThemes();
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const savedScore = getScore();
    if (savedScore !== null) setScore(savedScore);
  }, []);

  return (
    <div className="page-dark relative pb-8 text-left overflow-hidden">

      {/* Halo ambiant — braise beForensic */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-10%] left-[10%] w-[50%] h-[45%] bg-brand-orange/8 blur-[120px] rounded-full" />
      </div>

      {/* --- SECTION HERO --- */}
      <div className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-24 px-4 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange/5 border border-brand-orange/10 text-brand-orange-400 text-xs font-semibold mb-6 sm:mb-8">
            <Sparkles className="w-4 h-4" aria-hidden="true" /> La sécurité numérique, en toute simplicité.
          </div>

          <h1 className="text-[2.25rem] leading-[1.1] sm:text-5xl md:text-7xl font-black text-white mb-6 sm:mb-8 tracking-tight md:leading-[1.05] max-w-[18ch] sm:max-w-none">
            Protégez votre activité{' '}
            <br className="hidden sm:block" />
            <span className="text-brand-orange">en toute sérénité.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-8 sm:mb-12 leading-relaxed max-w-2xl">
            CyberKit accompagne les indépendants et TPE belges avec un diagnostic clair
            et des outils concrets. Pas de jargon, juste de la protection.
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-5">
            <button
              type="button"
              onClick={() => navigate('/quiz')}
              className="focus-ring btn-glow w-full sm:w-auto justify-center px-8 py-4 bg-brand-orange text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-orange/25 transition-all flex items-center gap-3 group min-h-[48px]"
            >
              {score !== null ? 'Mettre à jour mon score' : 'Lancer mon diagnostic'}
              <ChevronRight className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/resources')}
              className="focus-ring w-full sm:w-auto justify-center px-8 py-4 bg-slate-800/40 border border-slate-700 text-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-800/60 transition-all min-h-[48px]"
            >
              Explorer les outils
            </button>
            <button
              type="button"
              onClick={() => navigate('/about')}
              className="focus-ring w-full sm:w-auto justify-center px-8 py-4 text-slate-400 rounded-2xl font-semibold text-lg hover:text-white transition-colors underline-offset-4 hover:underline min-h-[48px]"
            >
              Qui est beForensic ?
            </button>
          </div>
        </div>
      </div>

      {/* --- SECTION ÉTAPES --- */}
      <div className="relative z-10 px-4 mb-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Diagnostic", text: "Faites le point sur vos risques en quelques minutes." },
              { icon: Lock, title: "Apprentissage", text: "Des fiches pratiques et mémos vidéo accessibles." },
              { icon: Activity, title: "Progression", text: "Suivez l'évolution de votre score de sécurité." }
            ].map((step, i) => (
              <div key={i} className="surface-card-dark p-8 flex flex-col gap-5">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-brand-orange-400">
                  <step.icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{step.title}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- SECTION THÉMATIQUES (La bibliothèque) --- */}
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white">Thématiques clés</h2>
            <p className="text-slate-500 mt-2">Cliquez sur un domaine pour renforcer votre protection.</p>
          </div>
          <div className="flex items-center gap-2 text-brand-orange-400 font-semibold bg-brand-orange/5 border border-brand-orange/10 px-4 py-2 rounded-xl text-xs">
            <CheckCircle className="w-4 h-4" aria-hidden="true" /> Ressources gratuites à disposition
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {themes.map((theme) => {
            const IconComponent = getIconComponent(theme.title);

            return (
              <button
                key={theme.id}
                type="button"
                onClick={() =>
                  navigate(`/resources?themeId=${theme.id}`, {
                    state: { themeId: theme.id },
                  })
                }
                className="focus-ring bg-slate-800/35 p-6 rounded-panel border border-slate-700/40 text-left hover:border-brand-orange/50 hover:bg-slate-800/50 transition-all group flex items-center gap-5"
              >
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-brand-orange-400 transition-colors shrink-0">
                  <IconComponent className="w-7 h-7" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">
                    {theme.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">Accéder au module</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-brand-orange-400 group-hover:translate-x-1 transition-all" aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <div className="mt-20 mb-16">
          <ContactCtaBanner variant="dark" />
        </div>

        {/* --- SECTION GOOGLE REVIEWS --- */}
        <div className="pt-16 border-t border-slate-800">
          <GoogleReview />
        </div>
      </div>
    </div>
  );
}