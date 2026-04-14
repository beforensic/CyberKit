import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ExportProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('export-project', {
        method: 'POST'
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Download className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Exporter le projet
            </h1>
            <p className="text-gray-600">
              Téléchargez une archive complète de votre projet
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-2">
                Le fichier ZIP contiendra :
              </h2>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Tous les fichiers source (src/)</li>
                <li>• Configuration du projet</li>
                <li>• Migrations Supabase</li>
                <li>• Edge Functions</li>
                <li>• Documentation</li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">
                (Exclut : node_modules, .git, dist)
              </p>
            </div>

            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              {loading ? 'Génération en cours...' : 'Télécharger le projet'}
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2 text-sm">
              Après le téléchargement :
            </h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Décompressez l'archive</li>
              <li>2. Exécutez <code className="bg-blue-100 px-2 py-0.5 rounded">npm install</code></li>
              <li>3. Configurez vos variables d'environnement (.env)</li>
              <li>4. Lancez avec <code className="bg-blue-100 px-2 py-0.5 rounded">npm run dev</code></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
