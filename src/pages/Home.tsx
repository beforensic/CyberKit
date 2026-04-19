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
    supabase.from('themes').select('*').order('sort_order', { ascending: true }).then(({ data }) => {
      setThemes(data || []);
    });
    const savedScore = getScore();
    if (savedScore !== null) setScore(savedScore);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-20 text-left overflow-hidden">

      {/* --- EFFETS DE LUMIÈRE DE FOND (Look Stenow) --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[10%] right-[-5%] w-[30%] h-[30%] bg-rose-500/10 blur-[100px] rounded-full"></div>
      </div>

      {/* --- HERO SECTION --- */}
      <div className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-400 text-xs font-black uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles className="w-4 h-4" /> Intelligence Pédagogique Cyber
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-6 duration-1000">
            La résilience <br />
            <span className="text-gradient">sans limites.</span>
          </h1>

          <p className="text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            CyberKit transforme la sécurité numérique en un parcours fluide.
            Évaluez vos risques et protégez votre entreprise avec l'IA.
          </p>

          <div className="flex flex-wrap gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <button
              onClick={() => onNavigate('quiz')}
              className="px-10 py-5 bg-gradient-to-r from-orange-500 to-rose-600 text-white rounded-[2rem] font-black text-xl hover:scale-105 transition-all shadow-xl shadow-orange-500/20 flex items-center gap-3 group"
            >
              {score !== null ? 'Mettre à jour mon score' : 'Démarrer le diagnostic'}
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('resources')}
              className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-[2rem] font-black text-xl hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Explorer les guides
            </button>
          </div>
        </div>
      </div>

      {/* --- SECTION ÉTAPES (Glassmorphism) --- */}
      <div className="relative z-10 px-4 mb-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Target, title: "Diagnostic", text: "Identifiez vos failles en 5 minutes.", color: "text-orange-500" },
              { icon: Lock, title: "Apprentissage", text: "Des fiches sans jargon technique.", color: "text-rose-500" },
              { icon: Activity, title: "Protection", text: "Voyez votre cyber-score grimper.", color: "text-emerald-500" }
            ].map((step, i) => (
              <div key={i} className="glass-card p-8 rounded-[2.5rem] flex flex-col gap-6 group hover:border-white/20 transition-all">
                <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center ${step.color} group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-white mb-2">{i + 1}. {step.title}</h4>
                  <p className="text-slate-400 leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- SECTION THÉMATIQUES --- */}
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Votre Arsenal</h2>
            <p className="text-slate-500 text-lg mt-2">Maîtrisez chaque domaine de votre sécurité.</p>
          </div>
          <div className="inline-flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-5 py-2 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" /> +50 ressources activées
          </div>
        </div>

        {/* --- GRILLE DES THÈMES --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => {
            const IconComponent = getIconComponent(theme.title);

            return (
              <button
                key={theme.id}
                onClick={() => onNavigate('resources', theme.title)}
                className="glass-card p-8 rounded-[2.5rem] text-left hover:border-orange-500/50 transition-all group relative overflow-hidden flex items-center gap-6"
              >
                {/* Effet de hover lumineux sur la carte */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-500/20 group-hover:text-orange-500 transition-all shrink-0">
                  <IconComponent className="w-8 h-8" />
                </div>
                <div className="flex-1 relative z-10">
                  <h3 className="text-xl font-black text-white group-hover:text-orange-400 transition-colors flex items-center justify-between">
                    {theme.title}
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-[10px] font-black text-slate-500 mt-1 uppercase tracking-[0.2em]">Accéder au module</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* --- AVIS GOOGLE (Adapté au sombre) --- */}
        <div className="mt-32 pt-16 border-t border-white/5">
          <GoogleReview />
        </div>
      </div>
    </div>
  );
}