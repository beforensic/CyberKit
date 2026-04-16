import { Shield, Target, Zap } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 mb-12">
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <img
              src="https://fuxpnuqfktmbeidmshov.supabase.co/storage/v1/object/public/resources/Serge-About.png"
              alt="Serge Houtain"
              className="w-48 h-48 rounded-2xl object-cover shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">La cybersécurité, c'est avant tout une affaire humaine.</h1>
              <p className="text-slate-600 leading-relaxed">
                Je m'appelle Serge Houtain, fondateur de beForensic et créateur de <span className="font-bold text-[#E8650A]">CyberKit</span>.
                Mon objectif : vous aider à comprendre les risques réels et à adopter les bons réflexes, en toute simplicité.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-orange-50 text-[#E8650A] rounded-xl flex items-center justify-center mx-auto mb-4"><Shield /></div>
            <h3 className="font-bold mb-2">CyberKit en bref</h3>
            <p className="text-sm text-slate-500">Un outil gratuit de sensibilisation conçu pour les professionnels belges.</p>
          </div>
          {/* ... rajoute tes 2 autres blocs ici ... */}
        </div>
      </div>
    </div>
  );
}