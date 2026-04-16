import { Shield, Target, Zap, Award, Users, MessageSquare, Presentation, Laptop } from 'lucide-react';

export default function About() {
  const offerings = [
    {
      icon: Users,
      title: "Coaching individuel",
      text: "Un accompagnement personnalisé pour évaluer votre situation et renforcer vos pratiques numériques, à votre rythme.",
      color: "border-orange-600"
    },
    {
      icon: Presentation,
      title: "Sensibilisation sur site",
      text: "Une intervention directement dans votre entreprise pour former vos collaborateurs aux bonnes pratiques.",
      color: "border-orange-600"
    },
    {
      icon: Laptop,
      title: "Webinaires",
      text: "Des sessions en ligne interactives sur les thèmes qui vous concernent le plus.",
      color: "border-orange-600"
    },
    {
      icon: MessageSquare,
      title: "Conférences",
      text: "Des présentations adaptées à vos événements professionnels ou associatifs.",
      color: "border-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 pb-24 text-left">
      <div className="max-w-4xl mx-auto">

        {/* Bio Card */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 mb-12">
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
            <div className="relative shrink-0">
              {/* TA PHOTO ICI */}
              <img
                src="https://bzxzxzmxiqvnhmlcwqre.supabase.co/storage/v1/object/public/resources/Profil-1-beforensic.png"
                alt="Serge Houtain"
                className="w-48 h-48 rounded-2xl object-cover shadow-md border-4 border-white"
              />
              <div className="absolute -bottom-4 -right-4 bg-[#E8650A] text-white p-3 rounded-xl shadow-lg">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">
                La cybersécurité, c'est avant tout une <span className="text-[#E8650A]">affaire humaine</span>.
              </h1>
              <div className="space-y-4 text-slate-600 leading-relaxed text-sm md:text-base">
                <p>
                  Je m'appelle Serge Houtain, fondateur de beForensic et créateur de <span className="font-bold text-[#E8650A]">CyberKit</span>.
                </p>
                <p>
                  Pendant 22 ans, j'ai servi au sein de la Police Judiciaire Fédérale belge, notamment à l'Unité Régionale de Criminalité Informatique (RCCU). J'ai vu comment les cybercriminels exploitent non pas les machines, mais les personnes.
                </p>
                <p>
                  Cette expérience m'a convaincu d'une chose : la meilleure protection contre les cybermenaces n'est pas technique, elle est humaine. Former, sensibiliser, accompagner — voilà ce qui fait vraiment la différence.
                </p>
                <p>
                  Aujourd'hui, je mets cette expertise au service des indépendants, des professions libérales et des PME belges. Mon objectif : vous aider à comprendre les risques réels et à adopter les bons réflexes, en toute simplicité.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ce que je propose */}
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Ce que je propose</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {offerings.map((o, i) => (
            <div key={i} className={`bg-white p-8 rounded-2xl border-t-4 ${o.color} shadow-sm`}>
              <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center mb-4">
                <o.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-3">{o.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{o.text}</p>
            </div>
          ))}
        </div>

        {/* CyberKit callout final */}
        <div className="bg-[#EBF4FF] p-8 rounded-3xl border border-blue-100">
          <h3 className="text-2xl font-bold text-slate-900 mb-4 text-left">Et <span className="text-[#E8650A]">CyberKit</span> dans tout ça ?</h3>
          <p className="text-slate-600 leading-relaxed text-left">
            CyberKit est mon outil gratuit de sensibilisation à la cybersécurité, conçu spécialement pour les professionnels belges. Diagnostic personnalisé, ressources pratiques, conseils concrets — tout ce qu'il vous faut pour faire le point sur votre situation, pas à pas et gratuitement.
          </p>
        </div>

      </div>
    </div>
  );
}