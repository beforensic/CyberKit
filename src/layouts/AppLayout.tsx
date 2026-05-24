import { Outlet, useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';

const DARK_SURFACE_PATHS = ['/', '/quiz', '/quiz/resultats'];

export default function AppLayout() {
  const { pathname } = useLocation();
  const isDarkSurface = DARK_SURFACE_PATHS.includes(pathname);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkSurface ? 'bg-surface-dark text-slate-300' : 'bg-surface-light text-slate-900'}`}>
      <main>
        <Outlet />
      </main>
      <Navigation />
    </div>
  );
}
