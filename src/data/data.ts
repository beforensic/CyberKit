// Définition de la structure d'une ressource
export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'pdf' | 'video' | 'link';
  url: string;
  keywords: string[];
}

// Liste des ressources
export const resources: Resource[] = [
  
  // --- Catégorie : Mots de passe ---
  {
    id: '1',
    title: 'Les règles d\'or du mot de passe',
    description: 'Comment créer un mot de passe robuste et facile à retenir.',
    category: 'Mots de passe',
    type: 'pdf',
    url: '/pdf/regles-or-mdp.pdf',
    keywords: ['mdp', 'password', 'sécurité', 'piratage']
  },
  {
    id: '4',
    title: 'Activer la double authentification (2FA)',
    description: 'Tutoriel pas à pas pour sécuriser vos comptes Google et Microsoft.',
    category: 'Mots de passe',
    type: 'pdf',
    url: '/pdf/tuto-2fa.pdf',
    keywords: ['2fa', 'mfa', 'double facteur', 'sms']
  },

  // --- Catégorie : Phishing ---
  {
    id: '2',
    title: 'Reconnaître un email de Phishing',
    description: 'Vidéo de démonstration : analysez les indices suspects en 2 minutes.',
    category: 'Phishing',
    type: 'video',
    url: 'https://drive.google.com/file/d/VIDEO_ID_HERE/view?usp=sharing',
    keywords: ['email', 'arnaque', 'hameçonnage', 'lien']
  },

  // --- Catégorie : Outils ---
  {
    id: '3',
    title: 'Vérifier si mon email a fuité',
    description: 'Outil gratuit pour savoir si vos identifiants sont compromis.',
    category: 'Outils',
    type: 'link',
    url: 'https://haveibeenpwned.com',
    keywords: ['leak', 'fuite', 'hack', 'vérification']
  },

  // --- Catégorie : Mobilité ---
  {
    id: '5',
    title: 'Télétravail : Sécuriser son Wi-Fi',
    description: 'Les bons réglages pour votre box internet à la maison.',
    category: 'Mobilité & Télétravail',
    type: 'pdf',
    url: '/pdf/wifi-maison.pdf',
    keywords: ['wifi', 'wpa2', 'box', 'maison']
  },

  // --- Catégorie : Gestion de crise (Nouveau PDF Drive) ---
  {
    id: '6',
    title: 'Guide de réponse à incidents pour indépendants',
    description: 'Guide complet pour les professionnels libéraux belges confrontés à un incident de cybersécurité',
    category: 'Gestion de crise',
    type: 'pdf',
    url: 'https://drive.google.com/file/d/1BIstk1boC9UGY-QWOEwiKNcjfXFQnqCc/view?usp=sharing',
    keywords: ['cyberattaque', 'incident', 'plan']
  }

];