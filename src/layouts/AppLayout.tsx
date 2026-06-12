import { Outlet, useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const DARK_SURFACE_PATHS = ['/', '/quiz', '/quiz/resultats'];

export default function AppLayout() {
  const { pathname } = useLocation();
  const isDarkSurface = DARK_SURFACE_PATHS.includes(pathname);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkSurface ? 'bg-surface-dark text-slate-300' : 'bg-surface-light text-slate-900'}`}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-slate-900 focus:shadow-lg focus:ring-2 focus:ring-brand-orange"
      >
        Aller au contenu principal
      </a>
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
      <Navigation isDarkSurface={isDarkSurface} />
    </div>
  );
}
