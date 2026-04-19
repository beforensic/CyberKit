import { useState, useEffect } from 'react';
import { Shield, Zap, ArrowRight, Target, Lock, Activity, Sparkles, CheckCircle, ChevronRight } from 'lucide-react';
import { supabase, Theme } from '../lib/supabase';
import { getIconComponent } from '../utils/icons';
import { getScore } from '../utils/storage';
import GoogleReview from '../components/GoogleReview';

interface HomeProps {
  onNavigate: (page: any, filter?: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    // Récupération des thèmes avec l'ordre de tri
    supabase.from('themes').select('*').order('sort_order', { ascending: true }).then(({ data }) => {
      setThemes(data || []);
    });

    // Récupération du score local
    const savedScore = getScore();
    if (savedScore !== null) setScore(savedScore);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300 pb-20 text-left overflow-hidden">

      {/* --- HALOS DE LUMIÈRE DE FOND (L'effet vaporeux Stenow) --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[60%] h-[50%] bg-orange-500/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full"></div>
      </div>

      {/* --- SECTION HERO --- */}
      <div className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/5 border border-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Sparkles className="w-4 h-4" /> La sécurité numérique, en toute simplicité.
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-[1.05]">
            Protégez votre activité <br />
            <span className="text-gradient">en toute sérénité.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl">
            CyberKit accompagne les indépendants et TPE belges avec un diagnostic clair
            et des outils concrets. Pas de jargon, juste de la protection.
          </p>

          <div className="flex flex-wrap gap-5">
            <button
              onClick={() => onNavigate('quiz')}
              className="px-8 py-4 bg-gradient-to-r from-[#E8650A] to-orange-400 text-white rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(232,101,10,0.3)] transition-all flex items-center gap-3 group"
            >
              {score !== null ? 'Mettre à jour mon score' : 'Lancer mon diagnostic'}
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('resources')}
              className="px-8 py-4 bg-slate-800/40 border border-slate-700 text-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-800/60 transition-all backdrop-blur-sm"
            >
              Explorer les outils
            </button>
          </div>
        </div>
      </div>

      {/* --- SECTION ÉTAPES --- */}
      <div className="relative z-10 px-4 mb-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Diagnostic", text: "Faites le point sur vos risques en quelques minutes.", color: "text-orange-400" },
              { icon: Lock, title: "Apprentissage", text: "Des fiches pratiques et mémos vidéo accessibles.", color: "text-blue-400" },
              { icon: Activity, title: "Progression", text: "Suivez l'évolution de votre score de sécurité.", color: "text-emerald-400" }
            ].map((step, i) => (
              <div key={i} className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 p-8 rounded-[2rem] flex flex-col gap-5">
                <div className={`w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center ${step.color}`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">{step.title}</h4>
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
          <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/10 px-4 py-2 rounded-xl text-xs">
            <CheckCircle className="w-4 h-4" /> +50 ressources gratuites à disposition
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {themes.map((theme) => {
            const IconComponent = getIconComponent(theme.title);

            return (
              <button
                key={theme.id}
                onClick={() => onNavigate('resources', theme.title)}
                className="bg-slate-800/20 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-700/30 text-left hover:border-orange-500/50 hover:bg-slate-800/40 transition-all group flex items-center gap-5"
              >
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-orange-400 transition-colors shrink-0">
                  <IconComponent className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">
                    {theme.title}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Accéder au module</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
              </button>
            );
          })}
        </div>

        {/* --- SECTION GOOGLE REVIEWS --- */}
        <div className="mt-32 pt-16 border-t border-slate-800">
          <GoogleReview />
        </div>
      </div>
    </div>
  );
}