import { Star } from 'lucide-react';

interface GoogleReviewProps {
  variant?: 'banner' | 'card';
}

export default function GoogleReview({ variant = 'card' }: GoogleReviewProps) {
  if (variant === 'banner') {
    return (
      <div className="px-6 py-8 bg-white border-t border-slate-200">
        <div className="max-w-md mx-auto text-center">
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Rejoignez nos utilisateurs satisfaits et partagez votre expérience
          </p>
          <a
            href="https://www.google.com/search?hl=fr-BE&gl=be&q=beForensic,+Rue+Andr%C3%A9+Masquelier+35,+7000+Mons&ludocid=5704346060213982022&lsig=AB86z5VMUktlwZ-vtx0WlGadPLWz#lrd=0x8b257f26da49395:0x4f29e884d2f41346,3"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-primary hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            Laisser un avis Google
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <h3 className="font-bold text-slate-900 mb-2">Votre avis compte</h3>
      <p className="text-sm text-slate-600 mb-4">
        Aidez-nous à améliorer SecuriCoach en partageant votre expérience
      </p>
      <a
  
        href="https://www.google.com/search?hl=fr-BE&gl=be&q=beForensic,+Rue+Andr%C3%A9+Masquelier+35,+7000+Mons&ludocid=5704346060213982022&lsig=AB86z5VMUktlwZ-vtx0WlGadPLWz#lrd=0x8b257f26da49395:0x4f29e884d2f41346,3"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block w-full text-center px-4 py-2 bg-primary hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Laisser un avis Google
      </a>
    </div>
  );
}
