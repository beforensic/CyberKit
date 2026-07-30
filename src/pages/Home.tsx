import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Lock, Activity, Sparkles, CheckCircle, ChevronRight } from 'lucide-react';
import { getIconComponent } from '../utils/icons';
import { getScore } from '../utils/storage';
import { useThemes } from '../hooks/useThemes';
import { SERGE_PORTRAIT_ALT, SERGE_PORTRAIT_URL } from '../data/brand';
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

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-10%] left-[10%] w-[50%] h-[45%] bg-brand-orange/8 blur-[120px] rounded-full" />
      </div>

      {/* --- HERO --- */}
      <div className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20 px-4 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange/5 border border-brand-orange/10 text-brand-orange-400 text-xs font-semibold mb-6 sm:mb-8 font-sans">
            <Sparkles className="w-4 h-4" aria-hidden="true" /> La sécurité numérique, en toute simplicité.
          </div>

          <h1 className="font-display font-semibold text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.08] text-white mb-6 sm:mb-8 max-w-[16ch] sm:max-w-3xl">
            Protégez votre activité{' '}
            <span className="text-brand-orange">en toute sérénité.</span>
          </h1>

          <p className="font-sans text-base sm:text-lg md:text-xl text-slate-400 mb-8 sm:mb-10 leading-relaxed max-w-2xl">
            CyberKit accompagne les indépendants et TPE belges avec un diagnostic clair
            et des outils concrets. Pas de jargon, juste de la protection.
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-5">
            <button
              type="button"
              onClick={() => navigate('/quiz')}
              className="focus-ring btn-glow font-sans w-full sm:w-auto justify-center px-8 py-4 bg-brand-orange text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-orange/25 transition-all flex items-center gap-3 group min-h-[48px]"
            >
              {score !== null ? 'Mettre à jour mon score' : 'Lancer mon diagnostic'}
              <ChevronRight className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/resources')}
              className="focus-ring font-sans w-full sm:w-auto justify-center px-8 py-4 bg-slate-800/40 border border-slate-700 text-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-800/60 transition-all min-h-[48px]"
            >
              Explorer les outils
            </button>
          </div>
        </div>
      </div>

      {/* --- PREUVE HUMAINE --- */}
      <div className="relative z-10 px-4 mb-20 md:mb-28">
        <div className="max-w-6xl mx-auto">
          <div className="surface-card-dark p-6 md:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-stretch">
            <div className="shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-2 border-slate-700/80 shadow-lg bg-slate-800">
              <img
                src={SERGE_PORTRAIT_URL}
                alt={SERGE_PORTRAIT_ALT}
                width={144}
                height={144}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
            <div className="flex-1 text-center sm:text-left flex flex-col justify-center min-w-0">
              <p className="font-sans text-[10px] font-black uppercase tracking-widest text-brand-orange-400 mb-2">
                beForensic
              </p>
              <h2 className="font-display font-semibold text-[clamp(1.75rem,4vw,2.5rem)] text-white mb-3">
                Serge Houtain
              </h2>
              <p className="font-sans text-sm md:text-base text-slate-400 leading-relaxed max-w-xl mb-4">
                Ancien enquêteur à la Police Judiciaire Fédérale (RCCU) pendant 22 ans.
                CyberKit, c’est sa réponse concrète pour les indépendants et TPE belges — sans jargon.
              </p>
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="focus-ring font-sans self-center sm:self-start text-sm font-semibold text-brand-orange-400 hover:text-brand-orange transition-colors underline-offset-4 hover:underline"
              >
                Qui est beForensic ?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- PARCOURS COURT --- */}
      <div className="relative z-10 px-4 mb-24 md:mb-32">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display font-semibold text-[clamp(1.75rem,4vw,2.5rem)] text-white mb-8">
            Comment ça marche
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Target, title: 'Diagnostic', text: 'Faites le point sur vos risques en quelques minutes.' },
              { icon: Lock, title: 'Apprentissage', text: 'Des fiches pratiques et mémos accessibles.' },
              { icon: Activity, title: 'Progression', text: 'Suivez l’évolution de votre score de sécurité.' },
            ].map((step, i) => (
              <div key={i} className="flex gap-4 md:flex-col md:gap-5">
                <div className="w-11 h-11 shrink-0 bg-slate-800 rounded-xl flex items-center justify-center text-brand-orange-400">
                  <step.icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-sans text-lg font-bold text-white mb-1">{step.title}</h3>
                  <p className="font-sans text-sm text-slate-400 leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- THÉMATIQUES APERÇU --- */}
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="font-display font-semibold text-[clamp(1.75rem,4vw,2.5rem)] text-white">
              Quelques thématiques
            </h2>
            <p className="font-sans text-slate-400 mt-2">
              Un aperçu pour démarrer. Le diagnostic indique ensuite où renforcer en priorité.
            </p>
          </div>
          <div className="flex items-center gap-2 text-brand-orange-400 font-semibold bg-brand-orange/5 border border-brand-orange/10 px-4 py-2 rounded-xl text-xs font-sans">
            <CheckCircle className="w-4 h-4" aria-hidden="true" /> Ressources gratuites
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {themes.slice(0, 4).map((theme) => {
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
                className="focus-ring font-sans bg-slate-800/35 p-6 rounded-panel border border-slate-700/40 text-left hover:border-brand-orange/50 hover:bg-slate-800/50 transition-all group flex items-center gap-5"
              >
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-brand-orange-400 transition-colors shrink-0">
                  <IconComponent className="w-7 h-7" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">
                    {theme.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-1">Voir les ressources</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-brand-orange-400 group-hover:translate-x-1 transition-all" aria-hidden="true" />
              </button>
            );
          })}
        </div>

        {themes.length > 0 && (
          <div className="mt-8 flex justify-center sm:justify-start">
            <button
              type="button"
              onClick={() => navigate('/resources')}
              className="focus-ring font-sans inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-700 text-slate-200 font-semibold hover:border-brand-orange/50 hover:text-white transition-all min-h-[48px]"
            >
              Voir toute la bibliothèque
              {themes.length > 4 ? (
                <span className="text-slate-500 font-medium">({themes.length} thèmes)</span>
              ) : null}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="mt-16">
          <GoogleReview />
        </div>

        <div className="mt-12 mb-8">
          <ContactCtaBanner variant="dark" />
        </div>
      </div>
    </div>
  );
}
