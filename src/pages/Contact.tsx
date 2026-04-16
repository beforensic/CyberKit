import { useState, useEffect } from 'react';
import { Mail, MapPin, Send, CheckCircle, AlertCircle, Phone, Building, Home, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getScore, getThemeInterest } from '../utils/storage';
import GoogleReview from '../components/GoogleReview';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

interface ContactProps {
  onNavigate: (page: 'home' | 'quiz' | 'resources' | 'admin' | 'contact' | 'legal', filter?: string) => void;
  initialSubject?: string;
}

export default function Contact({ onNavigate, initialSubject = '' }: ContactProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);

  useEffect(() => {
    if (!isSubmitted) {
      if (initialSubject) {
        setSubject(initialSubject);
      } else {
        const params = new URLSearchParams(window.location.search);
        const urlSubject = params.get('subject');

        if (urlSubject) {
          setSubject(decodeURIComponent(urlSubject));
        } else {
          const savedScore = getScore();
          const themeInterest = getThemeInterest();

          if (savedScore && !subject) {
            setSubject(`Diagnostic CyberKit - Score : ${savedScore.score}/100`);
          }

          if (themeInterest && !message) {
            setMessage(`Bonjour,\n\nIntérêt particulier pour le thème : ${themeInterest}\n\n`);
          }
        }
      }
    }
  }, [isSubmitted, initialSubject]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email invalide';
    }

    if (!subject.trim()) {
      newErrors.subject = 'Le sujet est requis';
    }

    if (!message.trim()) {
      newErrors.message = 'Le message est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Veuillez corriger les erreurs dans le formulaire', 'error');
      return;
    }

    setLoading(true);

    try {
      const savedScore = getScore();
      const themeInterest = getThemeInterest();

      const { error: dbError } = await supabase.from('contact_messages').insert({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        quiz_score: savedScore?.score || null,
        theme_interest: themeInterest || null,
        status: 'new'
      });

      if (dbError) throw dbError;

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`;

      const emailResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim()
        })
      });

      const emailData = await emailResponse.json();

      if (!emailResponse.ok) {
        console.error('Erreur lors de l\'envoi de l\'email:', emailData);
        showToast('Message enregistré mais l\'envoi de l\'email a échoué.', 'error');
      }

      setSubmittedScore(savedScore?.score || null);
      setIsSubmitted(true);
      setErrors({});

      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error submitting contact form:', error);
      showToast('Erreur lors de l\'envoi du message. Veuillez réessayer.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center animate-[bounce_1s_ease-in-out]">
                <CheckCircle className="w-12 h-12 text-primary" />
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-4" style={{ color: '#2D3748' }}>
              Message bien reçu !
            </h1>

            <div className="text-gray-700 leading-relaxed mb-6 space-y-3">
              <p className="text-lg">
                Merci pour votre confiance. L'équipe <span className="font-bold text-primary">beForensic</span> a bien reçu votre demande
                {submittedScore !== null && (
                  <span> concernant votre score de <span className="font-bold text-primary">{submittedScore}/100</span></span>
                )}.
              </p>
              <p>
                Nous analysons vos besoins et reviendrons vers vous par email sous <span className="font-semibold">48 heures ouvrables</span>.
              </p>
            </div>

            <div className="bg-primary-50 border-2 border-slate-200 rounded-xl p-4 mb-8">
              <p className="text-sm text-gray-600">
                <span className="font-semibold" style={{ color: '#2D3748' }}>Confidentialité garantie :</span> Conformément à notre politique, votre message sera traité avec la plus stricte confidentialité.
              </p>
            </div>

            <GoogleReview variant="banner" />

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setSubmittedScore(null);
                }}
                className="px-6 py-3 bg-primary hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Envoyer un autre message
              </button>

              <button
                onClick={() => onNavigate('home')}
                className="px-6 py-3 bg-accent hover:bg-accent-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Retour à l'accueil
              </button>

              {submittedScore !== null && (
                <button
                  onClick={() => onNavigate('quiz')}
                  className="px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-primary hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  Refaire le diagnostic
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#FAFAFA' }}>
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-[slideIn_0.3s_ease-out] max-w-md ${toast.type === 'success'
            ? 'bg-primary text-white'
            : 'bg-red-500 text-white'
            }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: '#2D3748' }}>
            Contactez-nous
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Une question sur la cybersécurité ? Besoin d'un accompagnement personnalisé ? Nous sommes là pour vous aider.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-slate-100 hover:border-primary-200 transition-colors">
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2" style={{ color: '#2D3748' }}>Email</h3>
            <a
              href="mailto:contact@beforensic.be"
              className="text-primary hover:text-primary-700 font-medium transition-colors"
            >
              contact@beforensic.be
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-slate-100 hover:border-primary-200 transition-colors">
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2" style={{ color: '#2D3748' }}>Adresse</h3>
            <a
              href="https://maps.google.com/?q=Rue+André+Masquelier+35,+7000+Mons"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Rue André Masquelier 35<br />
              7000 Mons
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-slate-100 hover:border-primary-200 transition-colors">
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
              <Building className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2" style={{ color: '#2D3748' }}>Entreprise</h3>
            <p className="text-gray-600 font-medium">beForensic</p>
            <p className="text-sm text-gray-500">Services de cybersécurité</p>
            <p className="text-sm text-gray-500 mt-2">N° d'entreprise (BCE) : 0724.581.585</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#2D3748' }}>
            Envoyez-nous un message
          </h2>
          <p className="text-gray-600 mb-8">
            Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    setName(value);
                  }
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                maxLength={100}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.name
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-200 focus:border-primary'
                  }`}
                placeholder="Jean Dupont"
                disabled={loading}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 150) {
                    setEmail(value);
                  }
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                maxLength={150}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.email
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-200 focus:border-primary'
                  }`}
                placeholder="jean.dupont@exemple.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                Sujet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 150) {
                    setSubject(value);
                  }
                  if (errors.subject) setErrors({ ...errors, subject: '' });
                }}
                maxLength={150}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.subject
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-200 focus:border-primary'
                  }`}
                placeholder="Demande d'information"
                disabled={loading}
              />
              {errors.subject && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.subject}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 2000) {
                    setMessage(value);
                  }
                  if (errors.message) setErrors({ ...errors, message: '' });
                }}
                maxLength={2000}
                rows={6}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors resize-none ${errors.message
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-200 focus:border-primary'
                  }`}
                placeholder="Bonjour, je vous contacte au sujet de CyberKit pour..."
                disabled={loading}
              />
              {errors.message && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.message}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {message.length.toLocaleString('fr-FR')} / 2 000
              </p>
              <p className="text-sm text-gray-400 mt-2">
                💡 Vous cherchez un accompagnement personnalisé ? Découvrez nos services sur{' '}
                <a
                  href="https://beForensic.be"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 underline transition-colors"
                >
                  beForensic.be
                </a>
              </p>
            </div>

            <div className="bg-primary-50 border-2 border-slate-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold" style={{ color: '#2D3748' }}>Protection des données :</span> En envoyant ce formulaire, vous acceptez que vos données soient utilisées exclusivement pour répondre à votre demande. Aucune donnée n'est revendue ou utilisée à des fins marketing.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-600 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Envoyer le message
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Délai de réponse moyen : 24-48 heures ouvrées
          </p>
        </div>
      </div>
    </div>
  );
}
