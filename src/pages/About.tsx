import { Award, Users, Presentation, Laptop, MessageSquare, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SERGE_PORTRAIT_ALT, SERGE_PORTRAIT_URL } from '../data/brand';

export default function About() {
  const navigate = useNavigate();
  const offerings = [
    {
      icon: Users,
      title: "Coaching individuel",
      text: "Accompagnement personnalisé pour évaluer votre situation et renforcer vos pratiques numériques."
    },
    {
      icon: Presentation,
      title: "Sensibilisation",
      text: "Interventions directement dans votre entreprise pour former vos collaborateurs aux bons réflexes."
    },
    {
      icon: Laptop,
      title: "Webinaires",
      text: "Sessions interactives en ligne sur les thèmes de cybersécurité qui vous concernent au quotidien."
    },
    {
      icon: MessageSquare,
      title: "Conférences",
      text: "Présentations dynamiques adaptées à vos événements professionnels ou associatifs."
    }
  ];

  return (
    <div className="page-light py-12 md:py-20 px-4 pb-8 text-left">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/"
          className="focus-ring inline-flex items-center gap-2 text-brand-orange hover:text-brand-orange-600 font-semibold transition-colors mb-8 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          Retour à l'accueil
        </Link>

        {/* Bio Card */}
        <div className="bg-white p-8 md:p-16 rounded-[3rem] shadow-2xl border border-slate-100 mb-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" aria-hidden="true" />

          <div className="flex flex-col md:flex-row gap-16 items-center relative z-10">
            <div className="relative shrink-0">
              <div className="w-56 h-56 rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-100 bg-slate-100">
                <img
                  src={SERGE_PORTRAIT_URL}
                  alt={SERGE_PORTRAIT_ALT}
                  className="w-full h-full object-cover"
                  width={224}
                  height={224}
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-brand-orange text-white p-4 rounded-2xl shadow-xl">
                <Award className="w-8 h-8" aria-hidden="true" />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="font-display font-semibold text-[clamp(1.75rem,4vw,2.5rem)] md:text-[clamp(2.5rem,7vw,3.5rem)] text-slate-900 mb-6 leading-tight">
                La cybersécurité, c'est avant tout une <span className="text-brand-orange">affaire humaine.</span>
              </h1>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-sans">
                <p>
                  Je m'appelle Serge Houtain, fondateur de beForensic et créateur de <span className="font-bold text-brand-orange">CyberKit</span>.
                </p>
                <p>
                  Ancien enquêteur à la <span className="text-slate-900 font-semibold underline decoration-brand-orange-200 underline-offset-4">Police Judiciaire Fédérale belge (RCCU)</span> pendant 22 ans, j'ai vu comment les cybercriminels exploitent l'humain plutôt que la machine.
                </p>
                <p>
                  CyberKit est ma réponse : un outil gratuit pour que chaque indépendant et TPE belge puisse monter en compétence sans peur et sans jargon.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
          {offerings.map((o, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all text-center">
              <div className="w-12 h-12 bg-brand-orange-50 text-brand-orange rounded-xl flex items-center justify-center mx-auto mb-6">
                <o.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-3 text-sm md:text-base">{o.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{o.text}</p>
            </div>
          ))}
        </div>

        {/* CTA Section - Navigation Interne */}
        <div className="bg-slate-900 rounded-[2.5rem] p-12 text-center text-white shadow-2xl">
          <h2 className="font-display font-semibold text-[clamp(1.75rem,4vw,2.5rem)] mb-6">
            Besoin d'un accompagnement sur mesure ?
          </h2>
          <p className="text-slate-400 mb-10 max-w-2xl mx-auto text-lg font-sans">
            Que ce soit pour une conférence, une formation ou un coaching, je vous aide à transformer vos collaborateurs en votre première ligne de défense.
          </p>
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className="focus-ring px-10 py-5 bg-brand-orange rounded-2xl font-black text-lg hover:bg-brand-orange-600 transition-all shadow-xl active:scale-95 min-h-[48px]"
          >
            Me contacter directement
          </button>
        </div>

      </div>
    </div>
  );
}