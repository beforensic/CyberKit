import { Link } from 'react-router-dom';
import SslTrustLogo from './SslTrustLogo';

interface FooterProps {
  withBottomNavOffset?: boolean;
}

export default function Footer({ withBottomNavOffset = true }: FooterProps) {
  return (
    <footer
      className={`border-t border-slate-800 bg-surface-dark px-6 py-8 ${withBottomNavOffset ? 'pb-24' : 'pb-8'}`}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 text-center">
        <SslTrustLogo />
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} beForensic — CyberKit
        </p>
        <Link
          to="/legal"
          className="text-xs text-slate-400 hover:text-brand-orange transition-colors"
        >
          Mentions légales
        </Link>
      </div>
    </footer>
  );
}
