import { Star, CheckCircle } from 'lucide-react';

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
              Votre avis aide beForensic à rendre la cybersécurité accessible à tous.
            </p>
          </div>

          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring shrink-0 px-4 py-2.5 bg-white/10 text-white border border-slate-600 rounded-xl text-sm font-semibold hover:bg-white/15 transition-all flex items-center justify-center gap-2"
          >
            Laisser un avis
            <CheckCircle className="w-4 h-4 text-brand-orange" aria-hidden="true" />
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card-dark p-8 md:p-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-1 text-yellow-500 mb-4" aria-hidden="true">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} fill="currentColor" />
            ))}
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            beForensic est noté 5/5 sur Google
          </h3>
          <p className="text-slate-400 leading-relaxed max-w-xl">
            Rejoignez les entrepreneurs belges qui font confiance à beForensic, l’éditeur de CyberKit.
            Votre avis aide à rendre la cybersécurité accessible à tous.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-lg flex items-center gap-2"
          >
            Laisser un avis <CheckCircle className="text-brand-orange" aria-hidden="true" />
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
          <p className="text-xs font-medium text-slate-500">
            Propulsé par Google Reviews
          </p>
        </div>
      </div>
    </div>
  );
}
