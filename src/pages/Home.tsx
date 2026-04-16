import { useState, useEffect } from 'react';
import { Shield, Zap, ArrowRight, Target, Lock, Activity, Sparkles, CheckCircle } from 'lucide-react';
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

  // Fonction pour donner une couleur d'accentuation aux thèmes
  const getThemeStyles = (index: number) => {
    const styles = [
      { bg: 'bg-blue-50', text: 'text-blue-600' },
      { bg: 'bg-orange-50', text: 'text-orange-600' },
      { bg: 'bg-emerald-50', text: 'text-emerald-600' },
      { bg: 'bg-purple-50', text: 'text-purple-600' },
      { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    ];
    return styles[index % styles.length];
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20 text-left">

      {/* --- HERO SECTION (Resserrée) --- */}
      <div className="relative overflow-hidden bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/50 text-[#E8650A] text-xs font-bold mb-6 border border-orange-200 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> 1ère plateforme pédagogique Cyber en Belgique
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
              La cyber-résilience <br />
              <span className="text-[#E8650A]">à portée de clic.</span>
            </h1>
            <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-2xl">
              CyberKit transforme la complexité de la sécurité numérique en étapes simples. Évaluez votre risque, apprenez avec nos guides et protégez votre PME.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => onNavigate('quiz')} className="px-8 py-4 bg-[#E8650A] text-white rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all hover:shadow-lg flex items-center gap-3">
                {score !== null ? 'Mettre à jour mon score' : 'Lancer mon diagnostic'} <Shield className="w-5 h-5" />
              </button>
              <button onClick={() => onNavigate('resources')} className="px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-bold text-lg hover:border-slate-300 transition-all">
                Explorer les guides
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION ÉTAPES (Structurée) --- */}
      <div className="bg-white border-b border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "1. Diagnostic", text: "Identifiez vos failles en 5 minutes via notre questionnaire.", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: Lock, title: "2. Apprentissage", text: "Accédez à des fiches et mémos vidéo sans jargon technique.", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: Activity, title: "3. Action", text: "Appliquez les conseils et voyez votre cyber-score grimper.", color: "text-purple-600", bg: "bg-purple-50" }
            ].map((step, i) => (
              <div key={i} className="flex gap-5 p-2">
                <div className={`shrink-0 w-14 h-14 ${step.bg} ${step.color} rounded-2xl flex items-center justify-center`}>
                  <step.icon className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- TRANSITION / SOCIAL PROOF --- */}
      <div className="max-w-7xl mx-auto px-4 pt-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 pb-8 border-b border-slate-100">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Toutes nos thématiques</h2>
            <p className="text-slate-500 mt-1">Sélectionnez un domaine pour renforcer votre protection.</p>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl text-sm">
            <CheckCircle className="w-4 h-4" /> +50 ressources gratuites à votre disposition
          </div>
        </div>

        {/* --- GRILLE DES THÈMES (Colorée et resserrée) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme, index) => {
            const IconComponent = getIconComponent(theme.title);
            const themeColor = getThemeStyles(index);

            return (
              <button
                key={theme.id}
                onClick={() => onNavigate('resources', theme.title)}
                className="group bg-white p-6 rounded-[2rem] border border-slate-200 text-left hover:border-[#E8650A] transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 flex items-center gap-6"
              >
                <div className={`w-16 h-16 ${themeColor.bg} ${themeColor.text} rounded-2xl flex items-center justify-center group-hover:bg-orange-50 group-hover:text-[#E8650A] transition-colors`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#E8650A] transition-colors flex items-center justify-between">
                    {theme.title}
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Découvrir →</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* --- AVIS GOOGLE --- */}
        <div className="mt-20 pt-16 border-t border-slate-100">
          <GoogleReview />
        </div>
      </div>
    </div>
  );
}