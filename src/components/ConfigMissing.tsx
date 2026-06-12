import { Shield, FileText } from 'lucide-react';

export default function ConfigMissing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-orange/15 text-brand-orange mb-6">
          <Shield className="w-8 h-8" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Configuration manquante</h1>
        <p className="text-slate-400 leading-relaxed mb-6">
          Les variables <code className="text-brand-orange-300">VITE_SUPABASE_URL</code> et{' '}
          <code className="text-brand-orange-300">VITE_SUPABASE_ANON_KEY</code> ne sont pas
          définies. L&apos;application ne peut pas démarrer sans connexion Supabase.
        </p>
        <div className="text-left bg-slate-900 border border-slate-800 rounded-2xl p-5 text-sm text-slate-300 space-y-2">
          <p className="font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-orange" aria-hidden="true" />
            En local
          </p>
          <p>Copiez <code>.env.example</code> vers <code>.env</code> et renseignez vos clés Supabase.</p>
          <p className="font-semibold text-white pt-2">Sur Vercel</p>
          <p>Vérifiez que les variables sont bien définies pour Production, puis redéployez.</p>
        </div>
      </div>
    </div>
  );
}
