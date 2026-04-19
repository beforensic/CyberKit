import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Send, CheckCircle, AlertCircle, Phone, Home, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getScore, getThemeInterest } from '../utils/storage';
import GoogleReview from '../components/GoogleReview';

interface ContactProps {
  onNavigate: (page: any) => void;
  initialSubject?: string;
}

export default function Contact({ onNavigate, initialSubject }: ContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: initialSubject || '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si aucun sujet n'est fourni, on essaie de deviner basé sur le score ou l'intérêt
    if (!initialSubject) {
      const score = getScore();
      const theme = getThemeInterest();
      if (score !== null && score < 50) {
        setFormData(prev => ({ ...prev, subject: `Besoin d'accompagnement (Score: ${score}%)` }));
      } else if (theme) {
        setFormData(prev => ({ ...prev, subject: `Question sur : ${theme}` }));
      }
    }
  }, [initialSubject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await supabase
        .from('contact_messages')
        .insert([formData]);

      if (submitError) throw submitError;
      setSubmitted(true);
    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError("Désolé, l'envoi a échoué. Veuillez réessayer ou utiliser l'email direct.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white py-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Message envoyé !</h2>
          <p className="text-slate-600 mb-10 leading-relaxed">
            Merci de votre confiance. Serge Houtain reviendra vers vous personnellement dans les plus brefs délais.
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 pb-32 text-left">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Infos de contact */}
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-6">Contactez-nous</h1>
            <p className="text-lg text-slate-600 mb-12 leading-relaxed">
              Une question sur votre diagnostic ? Besoin d'une conférence de sensibilisation pour votre association ou TPE ? Échangeons ensemble.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                  <Mail className="w-6 h-6 text-[#E8650A]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Email direct</h3>
                  <p className="text-slate-600">contact@beforensic.be</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                  <MapPin className="w-6 h-6 text-[#E8650A]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Localisation</h3>
                  <p className="text-slate-600">Mons, Belgique</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-8 bg-slate-900 rounded-[2rem] text-white">
              <h3 className="font-bold text-xl mb-4">Serge Houtain</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Expert en cybercriminalité et fondateur de beForensic. Ma mission : rendre la sécurité numérique accessible à tous les indépendants belges.
              </p>
              <GoogleReview />
            </div>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <User className="w-4 h-4" /> Votre nom
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="Jean Dupont"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="jean@exemple.be"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <Home className="w-4 h-4" /> Sujet
                </label>
                <input
                  required
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="Comment sécuriser mes emails ?"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                  placeholder="Dites-nous en plus sur votre situation..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#E8650A] text-white rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {loading ? 'Envoi...' : (
                  <>
                    Envoyer ma demande <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}