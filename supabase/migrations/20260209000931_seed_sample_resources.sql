/*
  # Seed Sample Resources

  ## Overview
  This migration adds sample resources to demonstrate the Securicoach application features.

  ## 1. Resources Added
  - Multiple sample resources across different themes
  - Various resource types (pdf, video, audio, link)
  - Diverse tags for testing search and filter functionality

  ## 2. Important Notes
  - Resources use external URLs for demonstration purposes
  - Tags are carefully selected to demonstrate keyword filtering
  - Resources cover all 11 themes
*/

-- Insert sample resources
INSERT INTO resources (theme_id, title, description, type, url, tags) VALUES

-- Mots de passe
((SELECT id FROM themes WHERE slug = 'mots-de-passe'), 
 $$Guide complet des mots de passe sécurisés$$, 
 $$Apprenez à créer et gérer des mots de passe robustes pour protéger vos comptes professionnels et personnels.$$,
 'link',
 'https://www.cnil.fr/fr/les-conseils-de-la-cnil-pour-un-bon-mot-de-passe',
 ARRAY['mots de passe', 'sécurité', 'authentification', 'gestion']),

((SELECT id FROM themes WHERE slug = 'mots-de-passe'), 
 $$Double authentification : Le guide pratique$$, 
 $$Découvrez comment activer et utiliser la double authentification (2FA) pour renforcer la sécurité de vos comptes.$$,
 'link',
 'https://www.ssi.gouv.fr/guide/recommandations-relatives-a-lauthentification-multifacteur-et-aux-mots-de-passe/',
 ARRAY['2FA', 'authentification', 'sécurité', 'double facteur']),

-- Sauvegardes
((SELECT id FROM themes WHERE slug = 'sauvegardes'), 
 $$Stratégie de sauvegarde 3-2-1$$, 
 $$Adoptez la règle 3-2-1 pour vos sauvegardes : 3 copies, 2 supports différents, 1 copie hors site.$$,
 'link',
 'https://www.cybermalveillance.gouv.fr/tous-nos-contenus/fiches-reflexes/sauvegardes',
 ARRAY['sauvegarde', 'backup', 'protection', 'données']),

-- Ingénierie sociale
((SELECT id FROM themes WHERE slug = 'ingenierie-sociale'), 
 $$Détecter les tentatives de phishing$$, 
 $$Apprenez à identifier les emails frauduleux et les techniques d'ingénierie sociale utilisées par les cybercriminels.$$,
 'link',
 'https://www.cert.ssi.gouv.fr/information/CERTFR-2023-ACT-001/',
 ARRAY['phishing', 'email', 'arnaque', 'social engineering']),

-- Confidentialité
((SELECT id FROM themes WHERE slug = 'confidentialite'), 
 $$Chiffrement des appareils professionnels$$, 
 $$Guide pratique pour activer BitLocker (Windows) ou FileVault (Mac) sur vos ordinateurs professionnels.$$,
 'link',
 'https://support.microsoft.com/fr-fr/windows/chiffrement-de-l-appareil-dans-windows-cf7e2b6f-3e70-4052-9c66-f1a4e19f4d6e',
 ARRAY['chiffrement', 'encryption', 'BitLocker', 'FileVault', 'confidentialité']),

-- Systèmes d'information
((SELECT id FROM themes WHERE slug = 'systemes-information'), 
 $$Importance des mises à jour de sécurité$$, 
 $$Pourquoi et comment maintenir vos systèmes à jour pour éviter les failles de sécurité exploitables.$$,
 'link',
 'https://www.cybermalveillance.gouv.fr/tous-nos-contenus/bonnes-pratiques/mises-jour-logiciels',
 ARRAY['mises à jour', 'patches', 'vulnérabilités', 'maintenance']),

-- Réseaux sociaux
((SELECT id FROM themes WHERE slug = 'reseaux-sociaux'), 
 $$Sécuriser vos réseaux sociaux professionnels$$, 
 $$Bonnes pratiques pour protéger vos comptes LinkedIn, Twitter et autres réseaux sociaux professionnels.$$,
 'link',
 'https://www.cnil.fr/fr/reseaux-sociaux-ne-prenez-pas-de-risques-inutiles',
 ARRAY['réseaux sociaux', 'confidentialité', 'LinkedIn', 'vie privée']),

((SELECT id FROM themes WHERE slug = 'reseaux-sociaux'), 
 $$Dangers du Wi-Fi public$$, 
 $$Comprendre les risques liés aux réseaux Wi-Fi publics et comment utiliser un VPN pour vous protéger.$$,
 'link',
 'https://www.cybermalveillance.gouv.fr/tous-nos-contenus/bonnes-pratiques/wifi-public',
 ARRAY['WiFi', 'VPN', 'réseau public', 'sécurité mobile']),

-- Malveillance
((SELECT id FROM themes WHERE slug = 'malveillance'), 
 $$Menaces des supports amovibles$$, 
 $$Les risques liés aux clés USB et autres supports amovibles : malwares, ransomwares et bonnes pratiques.$$,
 'link',
 'https://www.cert.ssi.gouv.fr/information/CERTFR-2020-ACT-001/',
 ARRAY['USB', 'malware', 'ransomware', 'supports amovibles']),

-- Gouvernance
((SELECT id FROM themes WHERE slug = 'gouvernance'), 
 $$Politique de sécurité informatique$$, 
 $$Guide pour élaborer et mettre en place une politique de sécurité informatique efficace dans votre organisation.$$,
 'link',
 'https://www.ssi.gouv.fr/guide/la-cybersecurite-pour-les-tpe-pme/',
 ARRAY['politique', 'gouvernance', 'PSSI', 'organisation']),

-- Cadre juridique
((SELECT id FROM themes WHERE slug = 'cadre-juridique'), 
 $$RGPD : Guide pratique$$, 
 $$Comprendre et appliquer le Règlement Général sur la Protection des Données dans votre entreprise.$$,
 'link',
 'https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on',
 ARRAY['RGPD', 'données personnelles', 'conformité', 'légal']),

-- Généralités
((SELECT id FROM themes WHERE slug = 'generalites'), 
 $$Les fondamentaux de la cybersécurité$$, 
 $$Introduction aux concepts essentiels de la cybersécurité pour tous les professionnels.$$,
 'link',
 'https://www.cybermalveillance.gouv.fr/tous-nos-contenus/actualites/10-mesures-essentielles-assurer-securite-numerique-entreprise',
 ARRAY['cybersécurité', 'fondamentaux', 'introduction', 'bases']),

-- Ressources externes
((SELECT id FROM themes WHERE slug = 'ressources-externes'), 
 $$Centre d'expertise nationale en cybersécurité$$, 
 $$Site officiel de l'ANSSI : actualités, guides et recommandations en matière de sécurité numérique.$$,
 'link',
 'https://www.ssi.gouv.fr/',
 ARRAY['ANSSI', 'ressources', 'guides', 'référence'])

ON CONFLICT DO NOTHING;
