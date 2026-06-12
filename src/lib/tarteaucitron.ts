import type { TarteaucitronInitOptions } from '../types/tarteaucitron';
import { getMatomoConfig } from '../utils/matomoConfig';

const SCRIPT_ID = 'cyberkit-tarteaucitron';
const SCRIPT_SRC = '/tarteaucitron/tarteaucitron.min.js';

function registerCyberkitServices(): void {
  const tac = window.tarteaucitron;
  if (!tac) return;

  // Service « information » : needConsent true pour afficher le bandeau et mémoriser le choix.
  // Le stockage local (quiz, favoris) n’est pas bloqué par le refus (js/fallback vides).
  tac.services.cyberkit_preferences = {
    key: 'cyberkit_preferences',
    type: 'other',
    name: 'Préférences cookies et mémorisation locale',
    needConsent: true,
    cookies: ['tarteaucitron'],
    readmoreLink: '/legal#protection-donnees',
    js() {
      'use strict';
    },
    fallback() {
      'use strict';
    },
  };

  tac.job = tac.job || [];
  if (!tac.job.includes('cyberkit_preferences')) {
    tac.job.push('cyberkit_preferences');
  }

  registerMatomoIfConfigured(tac);
}

function registerMatomoIfConfigured(tac: NonNullable<Window['tarteaucitron']>): void {
  const matomo = getMatomoConfig();
  if (!matomo) return;

  tac.user = tac.user || {};
  tac.user.matomoId = matomo.siteId;
  tac.user.matomoHost = matomo.host;

  tac.job = tac.job || [];
  if (!tac.job.includes('matomo')) {
    tac.job.push('matomo');
  }

  window.addEventListener(
    'tac.root_available',
    () => {
      const service = tac.services.matomo;
      if (!service) return;
      service.needConsent = true;
      service.name = "Mesure d'audience (Matomo)";
      service.readmoreLink = '/legal#protection-donnees';
    },
    { once: true },
  );
}

/** Affiche le bandeau tant que l'utilisateur n'a pas enregistré de choix (cookie tarteaucitron). */
function ensureConsentBannerVisible(): void {
  const tac = window.tarteaucitron;
  if (!tac?.userInterface || !tac.cookie) return;

  const hasStoredChoice = tac.cookie.read().length > 0;
  if (!hasStoredChoice) {
    tac.userInterface.openAlert();
  }
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

  const onRootReady = () => {
    ensureConsentBannerVisible();
  };
  window.addEventListener('tac.root_available', onRootReady, { once: true });

  registerCyberkitServices();
  window.tarteaucitron?.init(getInitOptions());

  // Secours si l'événement a déjà été émis avant l'écouteur (SPA / chargement async).
  window.setTimeout(ensureConsentBannerVisible, 400);
}
