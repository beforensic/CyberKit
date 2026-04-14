import profilImage from '../assets/profil.png';

interface AboutProps {
  onNavigate?: (page: 'home' | 'quiz' | 'resources' | 'admin' | 'contact' | 'legal') => void;
}

export default function About({ onNavigate }: AboutProps) {
  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Hero Block - Présentation personnelle */}
        <section className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Photo */}
            <div className="flex-shrink-0">
              <img
                src={profilImage}
                alt="Serge Houtain"
                className="w-72 h-72 object-cover rounded-2xl shadow-lg border-2 border-slate-200"
              />
            </div>

            {/* Texte */}
            <div className="flex-1">
              <p className="text-2xl md:text-3xl font-semibold italic mb-6" style={{ color: '#E8650A' }}>
                La cybersécurité, c'est avant tout une affaire humaine.
              </p>

              <div className="space-y-4 text-slate-700 leading-relaxed">
                <p>
                  Je m'appelle Serge Houtain, fondateur de beForensic et créateur de SecuriCoach.
                </p>

                <p>
                  Pendant 22 ans, j'ai servi au sein de la Police Judiciaire Fédérale belge, notamment à l'Unité Régionale de Criminalité Informatique (RCCU). J'y ai enquêté sur des centaines de cybercrimes — arnaques en ligne, intrusions, fraudes numériques — et j'ai vu de près comment les cybercriminels exploitent non pas les machines, mais les personnes.
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
        </section>

        {/* Bloc Services */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#2D3748' }}>
            Ce que je propose
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Carte 1 */}
            <div className="bg-[#F7F7F7] rounded-xl p-6 border-t-4 shadow-sm" style={{ borderTopColor: '#E8650A' }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: '#2D3748' }}>
                Coaching individuel
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Un accompagnement personnalisé pour évaluer votre situation et renforcer vos pratiques numériques, à votre rythme.
              </p>
            </div>

            {/* Carte 2 */}
            <div className="bg-[#F7F7F7] rounded-xl p-6 border-t-4 shadow-sm" style={{ borderTopColor: '#E8650A' }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: '#2D3748' }}>
                Sensibilisation sur site
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Une intervention directement dans votre entreprise pour former vos collaborateurs aux bonnes pratiques.
              </p>
            </div>

            {/* Carte 3 */}
            <div className="bg-[#F7F7F7] rounded-xl p-6 border-t-4 shadow-sm" style={{ borderTopColor: '#E8650A' }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: '#2D3748' }}>
                Webinaires
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Des sessions en ligne interactives sur les thèmes qui vous concernent le plus.
              </p>
            </div>

            {/* Carte 4 */}
            <div className="bg-[#F7F7F7] rounded-xl p-6 border-t-4 shadow-sm" style={{ borderTopColor: '#E8650A' }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: '#2D3748' }}>
                Conférences
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Des présentations adaptées à vos événements professionnels ou associatifs.
              </p>
            </div>
          </div>
        </section>

        {/* Bloc SecuriCoach */}
        <section className="rounded-2xl shadow-md border border-slate-200 p-8 mb-8" style={{ backgroundColor: '#EBF2FA' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#2D3748' }}>
            Et CyberKit dans tout ça ?
          </h2>
          <p className="text-slate-700 leading-relaxed text-lg">
            CyberKit est mon outil gratuit de sensibilisation à la cybersécurité, conçu spécialement pour les professionnels belges. Diagnostic personnalisé, ressources pratiques, conseils concrets — tout ce qu'il vous faut pour faire le point sur votre situation, pas à pas et gratuitement.
          </p>
        </section>

        {/* Bloc CTA */}
        <section className="text-center">
          <button
            onClick={() => onNavigate?.('contact')}
            className="px-8 py-4 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: '#E8650A' }}
          >
            Prendre rendez-vous
          </button>
          <p className="text-sm text-slate-400 mt-3">
            Échange découverte gratuit et sans engagement
          </p>
        </section>
      </div>
    </div>
  );
}
