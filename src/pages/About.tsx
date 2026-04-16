import { Shield, Target, Zap, Award, Users, Presentation, Laptop, MessageSquare } from 'lucide-react';

interface AboutProps {
  onNavigate: (page: any) => void;
}

export default function About({ onNavigate }: AboutProps) {
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
    <div className="min-h-screen bg-[#FAFAFA] py-12 md:py-20 px-4 pb-32 text-left">
      <div className="max-w-5xl mx-auto">

        {/* Bio Card */}
        <div className="bg-white p-8 md:p-16 rounded-[3rem] shadow-2xl border border-slate-100 mb-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />

          <div className="flex flex-col md:flex-row gap-16 items-center relative z-10">
            <div className="relative shrink-0">
              <div className="w-56 h-56 rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-slate-100">
                <img
                  src="https://fuxpnuqfktmbeidmshov.supabase.co/storage/v1/object/public/resources/Serge-About.png"
                  alt="Serge Houtain"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-[#E8650A] text-white p-4 rounded-2xl shadow-xl">
                <Award className="w-8 h-8" />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                La cybersécurité, c'est avant tout une <span className="text-[#E8650A]">affaire humaine.</span>
              </h1>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  Je m'appelle Serge Houtain, fondateur de beForensic et créateur de <span className="font-bold text-[#E8650A]">CyberKit</span>.
                </p>
                <p>
                  Ancien enquêteur à la <span className="text-slate-900 font-semibold underline decoration-orange-200 underline-offset-4">Police Judiciaire Fédérale belge (RCCU)</span> pendant 22 ans, j'ai vu comment les cybercriminels exploitent l'humain plutôt que la machine.
                </p>
                <p>
                  CyberKit est ma réponse : un outil gratuit pour que chaque PME belge puisse monter en compétence sans peur et sans jargon.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
          {offerings.map((o, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border-b-4 border-orange-500 shadow-sm hover:shadow-lg transition-all text-center">
              <div className="w-12 h-12 bg-orange-50 text-[#E8650A] rounded-xl flex items-center justify-center mx-auto mb-6">
                <o.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-3 text-sm md:text-base">{o.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{o.text}</p>
            </div>
          ))}
        </div>

        {/* CTA Section - Navigation Interne */}
        <div className="bg-slate-900 rounded-[2.5rem] p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-6">Besoin d'un accompagnement sur mesure ?</h2>
          <p className="text-slate-400 mb-10 max-w-2xl mx-auto text-lg">
            Que ce soit pour une conférence, une formation ou un coaching, je vous aide à transformer vos collaborateurs en votre première ligne de défense.
          </p>
          <button
            onClick={() => onNavigate('contact')}
            className="px-10 py-5 bg-[#E8650A] rounded-2xl font-black text-lg hover:bg-orange-600 transition-all shadow-xl active:scale-95"
          >
            Me contacter directement
          </button>
        </div>

      </div>
    </div>
  );
}