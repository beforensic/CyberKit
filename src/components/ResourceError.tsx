import { AlertTriangle, ArrowLeft, Mail } from 'lucide-react';

interface ResourceErrorProps {
  resourceTitle: string;
  onBack: () => void;
  onContactAdmin: () => void;
}

export default function ResourceError({ resourceTitle, onBack, onContactAdmin }: ResourceErrorProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div
        role="alertdialog"
        aria-labelledby="resource-error-title"
        aria-describedby="resource-error-desc"
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" aria-hidden="true" />
          </div>

          <h2 id="resource-error-title" className="text-2xl font-bold text-slate-900 mb-2">
            Ressource indisponible
          </h2>

          <p id="resource-error-desc" className="text-slate-600 mb-6">
            La ressource <span className="font-semibold text-slate-900">"{resourceTitle}"</span> n’est
            temporairement pas accessible. Le lien peut être cassé ou le fichier a été déplacé.
          </p>

          <div className="w-full space-y-3">
            <button
              type="button"
              onClick={onBack}
              className="focus-ring w-full py-3 bg-brand-orange hover:bg-brand-orange-600 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/20"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
              Retour aux ressources
            </button>

            <button
              type="button"
              onClick={onContactAdmin}
              className="focus-ring w-full py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" aria-hidden="true" />
              Nous contacter
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Nous nous excusons pour ce désagrément et travaillons à résoudre le problème.
          </p>
        </div>
      </div>
    </div>
  );
}
