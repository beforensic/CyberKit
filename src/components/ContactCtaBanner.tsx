import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Shield } from 'lucide-react';

interface ContactCtaBannerProps {
  variant?: 'dark' | 'light';
  subject?: string;
  title?: string;
  description?: string;
  compact?: boolean;
}

export default function ContactCtaBanner({
  variant = 'dark',
  subject = "Besoin d'accompagnement personnalisé",
  title = 'Besoin d\'un expert à vos côtés ?',
  description = 'Formation, coaching ou audit : Serge Houtain (beForensic) vous accompagne au-delà des ressources gratuites de CyberKit.',
  compact = false,
}: ContactCtaBannerProps) {
  const contactUrl = `/contact?subject=${encodeURIComponent(subject)}`;
  const isDark = variant === 'dark';

  if (compact) {
    return (
      <Link
        to={contactUrl}
        className={`focus-ring flex items-center justify-between gap-4 p-5 rounded-2xl border transition-all min-h-[48px] ${
          isDark
            ? 'bg-brand-orange/10 border-brand-orange/30 hover:border-brand-orange text-white'
            : 'bg-brand-orange-50 border-brand-orange/20 hover:border-brand-orange text-slate-900'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 rounded-xl shrink-0 ${isDark ? 'bg-brand-orange text-white' : 'bg-brand-orange text-white'}`}>
            <Mail className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="font-bold text-sm truncate">{title}</span>
        </div>
        <ArrowRight className={`w-5 h-5 shrink-0 ${isDark ? 'text-brand-orange-400' : 'text-brand-orange'}`} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-panel p-8 md:p-10 border ${
        isDark
          ? 'bg-slate-800/50 border-brand-orange/25'
          : 'bg-brand-orange-50/80 border-brand-orange/20 shadow-md shadow-brand-orange/5'
      }`}
    >
      {isDark && (
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-orange/20 blur-[80px] rounded-full pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
        <div className={`p-4 rounded-2xl shrink-0 ${isDark ? 'bg-brand-orange text-white' : 'bg-brand-orange text-white'}`}>
          <Shield className="w-8 h-8" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`text-[10px] font-black uppercase tracking-widest mb-2 ${
              isDark ? 'text-brand-orange-400' : 'text-brand-orange'
            }`}
          >
            Accompagnement beForensic
          </p>
          <h2 className={`text-2xl md:text-3xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {title}
          </h2>
          <p className={`text-sm md:text-base leading-relaxed max-w-xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {description}
          </p>
        </div>

        <Link
          to={contactUrl}
          className="focus-ring inline-flex w-full md:w-auto items-center justify-center gap-3 px-8 py-4 bg-brand-orange text-white rounded-2xl font-black text-lg hover:bg-brand-orange-600 transition-all shadow-xl shadow-brand-orange/25 shrink-0 min-h-[48px]"
        >
          <Mail className="w-5 h-5" aria-hidden="true" />
          Me contacter
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
