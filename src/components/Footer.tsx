import { Link } from 'react-router-dom';
import SslTrustLogo from './SslTrustLogo';

interface FooterProps {
  withBottomNavOffset?: boolean;
  variant?: 'dark' | 'light';
}

export default function Footer({ withBottomNavOffset = true, variant = 'dark' }: FooterProps) {
  const isDark = variant === 'dark';

  return (
    <footer
      className={`border-t px-6 py-8 ${
        isDark
          ? 'border-slate-800 bg-surface-dark'
          : 'border-slate-200 bg-white'
      } ${withBottomNavOffset ? 'footer-with-nav' : 'pb-8'}`}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 text-center">
        <SslTrustLogo />
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          © {new Date().getFullYear()} beForensic — CyberKit
        </p>
        <nav aria-label="Liens secondaires" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link
            to="/about"
            className={`focus-ring text-sm font-medium transition-colors rounded-lg ${
              isDark ? 'text-slate-300 hover:text-brand-orange' : 'text-slate-600 hover:text-brand-orange'
            }`}
          >
            À propos
          </Link>
          <Link
            to="/legal"
            className={`focus-ring text-sm font-medium transition-colors rounded-lg ${
              isDark ? 'text-slate-300 hover:text-brand-orange' : 'text-slate-600 hover:text-brand-orange'
            }`}
          >
            Mentions légales
          </Link>
        </nav>
      </div>
    </footer>
  );
}
