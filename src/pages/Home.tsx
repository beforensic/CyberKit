import { useState, useEffect } from 'react';
import { Shield, Zap, ArrowRight, Target, Lock, Activity } from 'lucide-react';
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
      {/* Hero */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#E8650A] text-sm font-bold mb-6 border border-orange-100">
              <Zap className="w-4 h-4" /> Plateforme pédagogique
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
              Protégez votre <span className="text-[#E8650A]">PME</span> sans être informaticien.
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              CyberKit est une boîte à outils gratuite pour les professionnels belges : évaluez votre niveau de sécurité et accédez à des guides concrets pour agir.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => onNavigate('quiz')} className="px-8 py-4 bg-[#E8650A] text-white rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20">
                {score !== null ? 'Repasser mon diagnostic' : 'Faire mon diagnostic'} <Shield className="w-5 h-5" />
              </button>
              <button onClick={() => onNavigate('resources')} className="px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
                Explorer les guides
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Trois piliers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6"><Target className="w-6 h-6" /></div>
            <h4 className="font-bold text-slate-900 mb-3">Évaluez vos risques</h4>
            <p className="text-sm text-slate-500">Un questionnaire rapide pour identifier vos failles de sécurité prioritaires.</p>
          </div>
          <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6"><Lock className="w-6 h-6" /></div>
            <h4 className="font-bold text-slate-900 mb-3">Apprenez l'essentiel</h4>
            <p className="text-sm text-slate-500">Des fiches pratiques et mémos vidéo conçus pour être compris par tous.</p>
          </div>
          <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6"><Activity className="w-6 h-6" /></div>
            <h4 className="font-bold text-slate-900 mb-3">Suivez votre score</h4>
            <p className="text-sm text-slate-500">Suivez vos progrès au fur et à mesure que vous sécurisez votre activité.</p>
          </div>
        </div>

        {/* Thèmes */}
        <h2 className="text-3xl font-bold text-slate-900 mb-10">Toutes nos thématiques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => {
            const IconComponent = getIconComponent(theme.icon);
            return (
              <button key={theme.id} onClick={() => onNavigate('resources', theme.title)} className="group bg-white p-8 rounded-3xl border border-slate-200 text-left hover:border-[#E8650A] transition-all shadow-sm">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-50 transition-colors">
                  <IconComponent className="w-7 h-7 text-slate-400 group-hover:text-[#E8650A]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center justify-between">
                  {theme.title} <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all text-[#E8650A]" />
                </h3>
              </button>
            );
          })}
        </div>

        <div className="mt-20"><GoogleReview /></div>
      </div>
    </div>
  );
}