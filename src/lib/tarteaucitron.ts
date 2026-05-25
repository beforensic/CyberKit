import type { TarteaucitronInitOptions } from '../types/tarteaucitron';

const SCRIPT_ID = 'cyberkit-tarteaucitron';
const SCRIPT_SRC = '/tarteaucitron/tarteaucitron.min.js';

function registerCyberkitServices(): void {
  const tac = window.tarteaucitron;
  if (!tac) return;

  tac.services.cyberkit_storage = {
    key: 'cyberkit_storage',
    type: 'other',
    name: 'Mémorisation locale (quiz, favoris, progression)',
    needConsent: false,
    cookies: [],
    readmoreLink: '/legal#protection-donnees',
    js() {
      'use strict';
    },
    fallback() {
      'use strict';
    },
  };

  tac.job = tac.job || [];
  if (!tac.job.includes('cyberkit_storage')) {
    tac.job.push('cyberkit_storage');
  }

  // Mesure d'audience (ex. Matomo) : décommenter et renseigner l'ID quand activé.
  // tac.user = tac.user || {};
  // tac.user.matomoId = 'VOTRE_ID_MATOMO';
  // tac.job.push('matomo');
}

function getInitOptions(): TarteaucitronInitOptions {
  return {
    privacyUrl: '/legal#protection-donnees',
    bodyPosition: 'bottom',
    hashtag: '#tarteaucitron',
    cookieName: 'tarteaucitron',
    orientation: 'middle',
    groupServices: true,
    showDetailsOnClick: true,
    serviceDefaultState: 'wait',
    showAlertSmall: false,
    cookieslist: false,
    cookieslistEmbed: true,
    showIcon: true,
    iconPosition: 'TopLeft',
    adblocker: false,
    DenyAllCta: true,
    AcceptAllCta: true,
    highPrivacy: true,
    alwaysNeedConsent: false,
    handleBrowserDNTRequest: false,
    removeCredit: false,
    moreInfoLink: true,
    useExternalCss: false,
    useExternalJs: false,
    readmoreLink: '/legal#protection-donnees',
    mandatory: true,
    mandatoryCta: false,
    googleConsentMode: true,
    bingConsentMode: true,
    softConsentMode: false,
    partnersList: false,
  };
}

function loadScript(): Promise<void> {
  if (window.__cyberkitTarteaucitronLoaded) {
    return Promise.resolve();
  }

  const existing = document.getElementById(SCRIPT_ID);
  if (existing) {
    return window.tarteaucitron
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
          existing.addEventListener('load', () => resolve());
          existing.addEventListener('error', () => reject(new Error('tarteaucitron load failed')));
        });
  }

  window.tarteaucitronForceLanguage = 'fr';
  window.tarteaucitronUseMin = true;
  window.tarteaucitronCustomText = {
    alertBigPrivacy:
      'CyberKit utilise un cookie de préférences et peut enregistrer des données sur votre appareil pour le quiz et vos favoris. Aucun cookie publicitaire n’est activé par défaut.',
    disclaimer:
      'Les services optionnels (mesure d’audience, etc.) ne se chargent qu’après votre accord. Les données locales du diagnostic restent sur votre appareil.',
  };

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      window.__cyberkitTarteaucitronLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Impossible de charger tarteaucitron.js'));
    document.head.appendChild(script);
  });
}

let initStarted = false;

export async function initTarteaucitron(): Promise<void> {
  if (initStarted) return;
  initStarted = true;

  await loadScript();
  registerCyberkitServices();
  window.tarteaucitron?.init(getInitOptions());
}
