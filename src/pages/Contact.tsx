import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, MapPin, Send, CheckCircle, AlertCircle, User, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getScore, getThemeInterest } from '../utils/storage';
import GoogleReview from '../components/GoogleReview';

import {
  validateContactSubmission,
  getContactValidationMessage,
} from '../utils/contactForm';

export default function Contact() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get('subject') || '';
  const formLoadedAt = useRef(Date.now());
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: initialSubject || '',
    message: '',
    website: '',
  });
  const [gdprConsent, setGdprConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    const validationError = validateContactSubmission({
      formLoadedAt: formLoadedAt.current,
      gdprConsent,
      website: formData.website,
    });

    if (validationError) {
      setError(getContactValidationMessage(validationError));
      setLoading(false);
      return;
    }

    try {
      const score = getScore();
      const theme = getThemeInterest();

      const { data, error: submitError } = await supabase.functions.invoke('submit-contact', {
        body: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          website: formData.website,
          formLoadedAt: formLoadedAt.current,
          quiz_score: score,
          theme_interest: theme,
          gdprConsent: true,
        },
      });

      if (submitError) throw submitError;
      if (data?.error) throw new Error(data.error);

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
          <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-10 h-10 text-brand-orange" />
          </div>
          <h2 className="font-display font-semibold text-[clamp(1.75rem,4vw,2.5rem)] text-slate-900 mb-4">Message envoyé !</h2>
          <p className="text-slate-600 mb-10 leading-relaxed">
            Merci de votre confiance. Serge Houtain reviendra vers vous personnellement dans les plus brefs délais.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="focus-ring w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-light py-12 px-4 pb-8 text-left">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          <div>
            <h1 className="font-display font-semibold text-[clamp(1.75rem,4vw,2.5rem)] md:text-[clamp(2.5rem,7vw,3.25rem)] text-slate-900 mb-6">
              Contactez-nous
            </h1>
            <p className="text-lg text-slate-600 mb-12 leading-relaxed">
              Une question sur votre diagnostic ? Besoin d'une conférence de sensibilisation pour votre association ou TPE ? Échangeons ensemble.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                  <Mail className="w-6 h-6 text-brand-orange" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Email direct</h3>
                  <p className="text-slate-600">contact@beforensic.be</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                  <MapPin className="w-6 h-6 text-brand-orange" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Localisation</h3>
                  <p className="text-slate-600">Mons, Belgique</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-8 bg-slate-900 rounded-[2rem] text-white">
              <h3 className="font-bold text-xl mb-4">Serge Houtain</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Expert en cybercriminalité et fondateur de beForensic. Ma mission : rendre la sécurité numérique accessible aux indépendants et TPE belges.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-orange-300 hover:text-brand-orange transition-colors mb-6"
              >
                En savoir plus sur beForensic
              </Link>
              <GoogleReview variant="compact" />
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-slate-100">
            <form onSubmit={handleSubmit} className="relative space-y-6">
              {error && (
                <div role="alert" className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" aria-hidden="true" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
                className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
                aria-hidden="true"
              />

              <div className="space-y-2">
                <label htmlFor="contact-name" className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <User className="w-4 h-4" aria-hidden="true" /> Votre nom
                </label>
                <input
                  id="contact-name"
                  required
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="focus-ring w-full px-6 py-4 bg-slate-50 border-none rounded-2xl transition-all"
                  placeholder="Jean Dupont"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-email" className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <Mail className="w-4 h-4" aria-hidden="true" /> Email
                </label>
                <input
                  id="contact-email"
                  required
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="focus-ring w-full px-6 py-4 bg-slate-50 border-none rounded-2xl transition-all"
                  placeholder="jean@exemple.be"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-subject" className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <Home className="w-4 h-4" aria-hidden="true" /> Sujet
                </label>
                <input
                  id="contact-subject"
                  required
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="focus-ring w-full px-6 py-4 bg-slate-50 border-none rounded-2xl transition-all"
                  placeholder="Comment sécuriser mes emails ?"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-message" className="text-sm font-bold text-slate-700 ml-1">Message</label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="focus-ring w-full px-6 py-4 bg-slate-50 border-none rounded-2xl transition-all resize-none"
                  placeholder="Dites-nous en plus sur votre situation..."
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label
                  htmlFor="contact-gdpr-consent"
                  className="flex items-start gap-3 cursor-pointer"
                >
                  <input
                    id="contact-gdpr-consent"
                    type="checkbox"
                    required
                    checked={gdprConsent}
                    onChange={e => setGdprConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-orange focus:ring-brand-orange/30"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    J'accepte que beForensic traite mes données personnelles (nom, adresse e-mail et
                    contenu du message) pour répondre à ma demande de contact, conformément à la{' '}
                    <Link
                      to="/legal#protection-donnees"
                      className="text-brand-orange font-semibold hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      politique de confidentialité
                    </Link>
                    . Je peux exercer mes droits (accès, rectification, suppression) en écrivant à{' '}
                    <a
                      href="mailto:contact@beforensic.be"
                      className="text-brand-orange font-semibold hover:underline"
                    >
                      contact@beforensic.be
                    </a>
                    .
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !gdprConsent}
                aria-busy={loading}
                className="focus-ring w-full py-5 bg-brand-orange text-white rounded-2xl font-bold text-lg hover:bg-brand-orange-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-orange/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
