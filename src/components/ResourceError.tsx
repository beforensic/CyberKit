import { AlertTriangle, ArrowLeft, Mail } from 'lucide-react';

interface ResourceErrorProps {
  resourceTitle: string;
  onBack: () => void;
  onContactAdmin: () => void;
}

export default function ResourceError({ resourceTitle, onBack, onContactAdmin }: ResourceErrorProps) {
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ressource Indisponible
          </h2>

          <p className="text-gray-600 mb-6">
            La ressource <span className="font-semibold text-gray-900">"{resourceTitle}"</span> n'est temporairement pas accessible. Le lien peut être cassé ou le fichier a été déplacé.
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={onBack}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour aux ressources
            </button>

            <button
              onClick={onContactAdmin}
              className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Mail className="w-5 h-5" />
              Contacter l'administrateur
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Nous nous excusons pour ce désagrément et travaillons à résoudre le problème.
          </p>
        </div>
      </div>
    </div>
  );
}
