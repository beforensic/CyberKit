import { Shield, Target, Zap, Award, Users, BookOpen } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: Shield,
      title: "CyberKit en bref",
      text: "Un outil gratuit de sensibilisation conçu pour les indépendants, professions libérales et PME belges."
    },
    {
      icon: Target,
      title: "Notre mission",
      text: "Rendre la cybersécurité accessible en traduisant les concepts techniques en actions simples."
    },
    {
      icon: Zap,
      title: "Approche concrète",
      text: "Pas de théorie inutile, uniquement des ressources prêtes à être appliquées dans votre quotidien."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 pb-24">
      <div className="max-w-4xl mx-auto">

        {/* Bio Section */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200 mb-12">
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-left">
            <div className="relative shrink-0">
              <img
                src="https://fuxpnuqfktmbeidmshov.supabase.co/storage/v1/object/public/resources/Serge-About.png"
                alt="Serge Houtain"
                className="w-48 h-48 rounded-2xl object-cover shadow-lg border-4 border-white"
              />
              <div className="absolute -bottom-4 -right-4 bg-[#E8650A] text-white p-3 rounded-xl shadow-lg">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">
                La cybersécurité, c'est avant tout une <span className="text-[#E8650A]">affaire humaine</span>.
              </h1>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Je m'appelle Serge Houtain, fondateur de beForensic et créateur de <span className="font-bold text-[#E8650A]">CyberKit</span>.
                </p>
                <p>
                  Pendant 22 ans, j'ai servi au sein de la Police Judiciaire Fédérale belge, notamment à l'Unité Régionale de Criminalité Informatique (RCCU). J'ai vu comment les cybercriminels exploitent non pas les machines, mais les personnes.
                </p>
                <p>
                  Ma conviction est simple : la meilleure protection n'est pas technique, elle est humaine. Informer, sensibiliser et accompagner est ce qui fait vraiment la différence.
                </p>
                <p>
                  Aujourd'hui, je mets cette expertise au service des PME belges pour vous aider à adopter les bons réflexes, en toute simplicité.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ce que je propose */}
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-left">Ce que nous proposons</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {values.map((v, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center transform hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-orange-50 text-[#E8650A] rounded-xl flex items-center justify-center mx-auto mb-6">
                <v.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-3">{v.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>

        {/* Call to action discret */}
        <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 text-center">
          <h3 className="text-xl font-bold text-blue-900 mb-4">Besoin d'aller plus loin ?</h3>
          <p className="text-blue-700 mb-6">Accompagnement individuel, sensibilisation sur site ou conférences : contactez-moi pour un devis personnalisé.</p>
          <button
            onClick={() => window.location.href = '/contact'}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            Prendre contact
          </button>
        </div>

      </div>
    </div>
  );
}