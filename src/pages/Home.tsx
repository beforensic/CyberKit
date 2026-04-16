import { useState, useEffect } from 'react';
import { Shield, Zap, ArrowRight, Target, Lock, Activity, Sparkles } from 'lucide-react';
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
    supabase.from('themes').select('*').order('title').then(({ data }) => setThemes(data || []));
    const savedScore = getScore();
    if (savedScore !== null) setScore(savedScore);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20 text-left">
      {/* Hero avec un petit gradient pour le relief */}
      <div className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-24 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/50 text-[#E8650A] text-sm font-bold mb-8 border border-orange-200">
              <Sparkles className="w-4 h-4" /> 1ère plateforme pédagogique Cyber en Belgique
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 tracking-tight leading-[1.1]">
              La cyber-résilience <br />
              <span className="text-[#E8650A]">à portée de clic.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl">
              CyberKit transforme la complexité de la sécurité numérique en étapes simples. Évaluez votre risque, apprenez avec nos guides et protégez votre PME dès aujourd'hui.
            </p>
            <div className="flex flex-wrap gap-5">
              <button onClick={() => onNavigate('quiz')} className="px-10 py-5 bg-[#E8650A] text-white rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all hover:shadow-[0_20px_40px_-15px_rgba(232,101,10,0.3)] flex items-center gap-3">
                {score !== null ? 'Mettre à jour mon score' : 'Lancer mon diagnostic'} <Shield className="w-5 h-5" />
              </button>
              <button onClick={() => onNavigate('resources')} className="px-10 py-5 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-bold text-lg hover:border-slate-300 transition-all">
                Voir la bibliothèque
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Section explicative "En 3 étapes" */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-28">
          {[
            { icon: Target, title: "1. Diagnostic", text: "Identifiez vos failles en 5 minutes via notre questionnaire intelligent.", color: "blue" },
            { icon: Lock, title: "2. Apprentissage", text: "Accédez à des fiches et mémos vidéo sans jargon technique.", color: "emerald" },
            { icon: Activity, title: "3. Action", text: "Appliquez les conseils et voyez votre cyber-score grimper.", color: "purple" }
          ].map((step, i) => (
            <div key={i} className="group p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all">
              <div className={`w-14 h-14 bg-${step.color}-50 text-${step.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <step.icon className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h4>
              <p className="text-slate-500 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>

        {/* Thématiques */}
        <h2 className="text-3xl font-black text-slate-900 mb-12 flex items-center gap-4">
          Toutes nos thématiques <div className="h-1 flex-1 bg-slate-100 rounded-full" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {themes.map((theme) => {
            // Ici, on passe le titre du thème au mapping pour avoir la bonne icône
            const IconComponent = getIconComponent(theme.title);
            return (
              <button key={theme.id} onClick={() => onNavigate('resources', theme.title)} className="group bg-white p-10 rounded-[2.5rem] border border-slate-200 text-left hover:border-[#E8650A] transition-all shadow-sm hover:shadow-2xl hover:-translate-y-2">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-orange-50 transition-colors">
                  <IconComponent className="w-8 h-8 text-slate-400 group-hover:text-[#E8650A] transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center justify-between">
                  {theme.title} <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-[#E8650A]" />
                </h3>
                <div className="text-sm font-bold text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">Consulter les ressources →</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}