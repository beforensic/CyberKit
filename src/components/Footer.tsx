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
      } ${withBottomNavOffset ? 'pb-24' : 'pb-8'}`}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 text-center">
        <SslTrustLogo />
        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          © {new Date().getFullYear()} beForensic — CyberKit
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link
            to="/about"
            className={`text-xs transition-colors ${
              isDark ? 'text-slate-400 hover:text-brand-orange' : 'text-slate-500 hover:text-brand-orange'
            }`}
          >
            À propos
          </Link>
          <Link
            to="/legal"
            className={`text-xs transition-colors ${
              isDark ? 'text-slate-400 hover:text-brand-orange' : 'text-slate-500 hover:text-brand-orange'
            }`}
          >
            Mentions légales
          </Link>
        </div>
      </div>
    </footer>
  );
}
