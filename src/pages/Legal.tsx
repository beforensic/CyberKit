import { ChevronLeft, Building2, Mail, ShieldCheck, Info } from 'lucide-react';

interface LegalProps {
  onNavigate: (page: 'home' | 'quiz' | 'resources' | 'admin' | 'contact' | 'legal') => void;
}

export default function Legal({ onNavigate }: LegalProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour
          </button>
          <h1 className="text-2xl font-bold text-slate-900 mt-3 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
            Mentions Légales
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-slate-900">Éditeur du site</h2>
          </div>

          <div className="space-y-4 text-slate-700">
            <div>
              <p className="font-semibold text-slate-900">beForensic</p>
              <p>Rue André Masquelier, 35</p>
              <p>7000 Mons, Belgique</p>
            </div>

            <div>
              <p><span className="font-semibold">BCE/TVA :</span> BE0724.581.585</p>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600" />
              <p>
                <span className="font-semibold">Contact :</span>{' '}
                <a
                  href="mailto:contact@beforensic.be"
                  className="text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  contact@beforensic.be
                </a>
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-6 h-6 text-amber-600" />
            <h2 className="text-2xl font-bold text-slate-900">Disclaimer</h2>
          </div>

          <div className="space-y-4 text-slate-700 leading-relaxed">
            <p>
              L'outil <strong>Securicoach</strong> est un outil purement <strong>pédagogique et informatif</strong> destiné à sensibiliser les utilisateurs aux bonnes pratiques en matière de cybersécurité.
            </p>

            <p>
              Les informations, ressources et recommandations fournies sur cette plateforme <strong>ne constituent en aucun cas</strong> :
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Un conseil juridique contraignant</li>
              <li>Un conseil technique ou professionnel personnalisé</li>
              <li>Une garantie d'exhaustivité ou d'actualité des informations</li>
              <li>Une certification de sécurité pour votre organisation</li>
            </ul>

            <p className="pt-4">
              <strong>beForensic</strong> décline toute responsabilité en cas de :
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Dommages directs ou indirects liés à l'utilisation de cet outil</li>
              <li>Interprétations erronées des données ou recommandations</li>
              <li>Décisions prises sur la base des informations fournies</li>
              <li>Incidents de sécurité survenus malgré le suivi des recommandations</li>
            </ul>

            <p className="pt-4 font-semibold text-slate-900">
              Pour toute question spécifique ou conseil personnalisé, nous vous recommandons de consulter
              un expert en cybersécurité ou un conseiller juridique qualifié.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-slate-900">Protection des Données (RGPD)</h2>
          </div>

          <div className="space-y-4 text-slate-700 leading-relaxed">
            <p>
              <strong>Securicoach</strong> a été conçu dans le respect le plus strict de votre vie privée
              et des réglementations européennes en matière de protection des données personnelles (RGPD).
            </p>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 my-6">
              <h3 className="font-bold text-emerald-900 mb-3 text-lg">Engagement de confidentialité</h3>
              <ul className="space-y-2 text-emerald-900">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Aucune donnée personnelle</strong> n'est collectée via l'application, à l'exception des informations transmises volontairement via le formulaire de contact</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Aucun cookie de tracking</strong> n'est utilisé pour vous suivre</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Aucun log d'activité</strong> n'est enregistré</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Aucun compte utilisateur</strong> n'est requis pour utiliser l'outil</span>
                </li>
              </ul>
            </div>

            <h3 className="font-bold text-slate-900 text-lg pt-4">Stockage local uniquement</h3>
            <p>
              Les seules données enregistrées sont stockées <strong>localement sur votre appareil</strong> (via le stockage local de votre navigateur) et comprennent uniquement :
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Votre score au quiz de diagnostic (pour affichage personnel)</li>
              <li>Vos réponses aux questions du quiz (pour votre suivi personnel)</li>
            </ul>

            <p className="pt-4">
              Ces données restent <strong>strictement confidentielles</strong>, ne quittent jamais votre appareil,
              et peuvent être supprimées à tout moment en effaçant les données de votre navigateur.
            </p>

            <h3 className="font-bold text-slate-900 text-lg pt-6">Ressources externes</h3>
            <p>
              Certaines ressources référencées peuvent pointer vers des sites web tiers.
              Nous vous invitons à consulter leurs politiques de confidentialité respectives.
            </p>

            <h3 className="font-bold text-slate-900 text-lg pt-6">Sous-traitants</h3>
            <p>
              Pour l'acheminement des emails issus du formulaire de contact, beForensic fait appel au service Resend (Resend Inc., USA). Le traitement est effectué en Europe (Irlande, eu-west-1). Les données transmises (nom, email, sujet, message) sont utilisées uniquement pour acheminer votre message et ne sont pas conservées au-delà du nécessaire. Pour plus d'informations :{' '}
              <a
                href="https://resend.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                https://resend.com/privacy
              </a>
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mt-6">
              <p className="text-sm text-slate-600">
                <strong>Dernière mise à jour :</strong> Mars 2026
              </p>
              <p className="text-sm text-slate-600 mt-2">
                Pour toute question concernant la protection de vos données, contactez-nous à :
                <a
                  href="mailto:contact@beforensic.be"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 hover:underline ml-1"
                >
                  contact@beforensic.be
                </a>
              </p>
            </div>
          </div>
        </section>

        <div className="text-center pt-8 pb-4">
          <p className="text-slate-500 text-sm">
            © 2026 beForensic - Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}
