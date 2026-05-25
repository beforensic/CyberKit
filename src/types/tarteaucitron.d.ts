export interface TarteaucitronService {
  key: string;
  type: string;
  name: string;
  needConsent: boolean;
  cookies: string[];
  readmoreLink?: string;
  js: () => void;
  fallback: () => void;
}

export interface TarteaucitronInitOptions {
  privacyUrl: string;
  bodyPosition: 'top' | 'bottom';
  hashtag: string;
  cookieName: string;
  orientation: 'top' | 'bottom' | 'middle' | 'popup';
  groupServices: boolean;
  showDetailsOnClick: boolean;
  serviceDefaultState: 'true' | 'wait' | 'false';
  showAlertSmall: boolean;
  cookieslist: boolean;
  cookieslistEmbed: boolean;
  showIcon: boolean;
  iconPosition: 'BottomRight' | 'BottomLeft' | 'TopRight' | 'TopLeft';
  adblocker: boolean;
  DenyAllCta: boolean;
  AcceptAllCta: boolean;
  highPrivacy: boolean;
  alwaysNeedConsent: boolean;
  handleBrowserDNTRequest: boolean;
  removeCredit: boolean;
  moreInfoLink: boolean;
  useExternalCss: boolean;
  useExternalJs: boolean;
  readmoreLink: string;
  mandatory: boolean;
  mandatoryCta: boolean;
  googleConsentMode: boolean;
  bingConsentMode: boolean;
  softConsentMode: boolean;
  partnersList: boolean;
}

export interface TarteaucitronApi {
  init: (options: TarteaucitronInitOptions) => void;
  services: Record<string, TarteaucitronService>;
  job?: string[];
  user?: Record<string, string>;
}

declare global {
  interface Window {
    tarteaucitron?: TarteaucitronApi;
    tarteaucitronForceLanguage?: string;
    tarteaucitronUseMin?: boolean | string;
    tarteaucitronCustomText?: Record<string, Record<string, string> | string>;
    __cyberkitTarteaucitronLoaded?: boolean;
  }
}

export {};
