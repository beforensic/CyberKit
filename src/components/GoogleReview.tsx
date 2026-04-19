import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

export default function GoogleReview() {
  return (
    <div className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-[2.5rem] p-8 md:p-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-1 text-yellow-500 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} fill="currentColor" />
            ))}
          </div>
          <h3 className="text-2xl font-black text-white mb-4">
            CyberKit est noté 5/5 sur Google
          </h3>
          <p className="text-slate-400 leading-relaxed max-w-xl">
            Rejoignez les entrepreneurs belges qui sécurisent déjà leur activité avec nos outils.
            Votre avis nous aide à rendre la cybersécurité accessible à tous.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <a
            href="https://g.page/r/YOUR_GOOGLE_REVIEW_LINK/reviewhttps://www.google.com/search?q=beforensic+mons&oq=beforensic+mons&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIKCAEQABgIGA0YHjIKCAIQABgIGA0YHjIHCAMQABjvBTIHCAQQABjvBTIHCAUQABjvBTIGCAYQRRg8MgYIBxBFGDzSAQg2OTQ1ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-slate-100 transition-all shadow-xl flex items-center gap-2"
          >
            Laisser un avis <CheckCircle className="text-emerald-500" />
          </a>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            Propulsé par Google Reviews
          </p>
        </div>
      </div>
    </div>
  );
}