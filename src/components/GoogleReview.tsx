import { Star } from 'lucide-react';

const GOOGLE_REVIEW_URL =
  'https://www.google.com/search?hl=fr-BE&gl=be&q=beForensic,+Rue+Andr%C3%A9+Masquelier+35,+7000+Mons&ludocid=5704346060213982022&lsig=AB86z5VMUktlwZ-vtx0WlGadPLWz#lrd=0x8b257f26da49395:0x4f29e884d2f41346,3';

type GoogleReviewVariant = 'default' | 'compact';

interface GoogleReviewProps {
  variant?: GoogleReviewVariant;
}

export default function GoogleReview({ variant = 'default' }: GoogleReviewProps) {
  if (variant === 'compact') {
    return (
      <div className="pt-6 mt-6 border-t border-slate-700/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex items-center gap-0.5 text-yellow-500" aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <span className="text-sm font-semibold text-white">beForensic — 5/5 sur Google</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Preuve de confiance pour les indépendants et TPE qui s’appuient sur beForensic.
            </p>
          </div>

          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring shrink-0 px-4 py-2.5 bg-white/10 text-white border border-slate-600 rounded-xl text-sm font-semibold hover:bg-white/15 transition-all inline-flex items-center justify-center gap-2 min-h-[44px]"
          >
            Voir les avis
            <span className="sr-only"> sur Google (nouvel onglet)</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card-dark p-8 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
        <div className="flex items-center gap-1 text-yellow-500 shrink-0" aria-hidden="true">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={22} fill="currentColor" />
          ))}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
            beForensic est noté 5/5 sur Google
          </h3>
          <p className="text-slate-400 leading-relaxed max-w-xl">
            Les entrepreneurs belges font déjà confiance à beForensic, l’éditeur de CyberKit.
          </p>
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex mt-4 text-sm font-semibold text-brand-orange-400 hover:text-brand-orange transition-colors underline-offset-4 hover:underline"
          >
            Voir les avis sur Google
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
