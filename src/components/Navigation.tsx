import { Home, ClipboardList, BookOpen, Mail, Star, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Accueil', icon: Home, end: true },
  { path: '/quiz', label: 'Diagnostic', icon: ClipboardList, end: false },
  { path: '/resources', label: 'Ressources', icon: BookOpen, end: false },
  { path: '/favorites', label: 'Favoris', icon: Star, end: false },
  { path: '/about', label: 'À propos', icon: User, end: false },
  { path: '/contact', label: 'Contact', icon: Mail, end: false, highlight: true },
];

interface NavigationProps {
  isDarkSurface?: boolean;
}

export default function Navigation({ isDarkSurface = false }: NavigationProps) {
  const { pathname } = useLocation();

  const isQuizActive = pathname === '/quiz' || pathname.startsWith('/quiz/');

  const barClass = isDarkSurface
    ? 'bg-slate-900/95 border-slate-800 shadow-[0_-4px_24px_rgba(0,0,0,0.35)] backdrop-blur-md'
    : 'bg-white border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]';

  return (
    <nav
      aria-label="Navigation principale"
      className={`nav-dock fixed bottom-0 left-0 right-0 border-t pt-2 z-50 ${barClass}`}
    >
      <div className="max-w-2xl mx-auto flex justify-between items-stretch gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/quiz' ? isQuizActive : (
            item.end ? pathname === item.path : pathname.startsWith(item.path)
          );
          const isHighlight = item.highlight && !isActive;

          const idleText = isDarkSurface ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700';
          const activeText = 'text-brand-orange';
          const highlightText = isDarkSurface ? 'text-brand-orange-300 hover:text-brand-orange' : 'text-brand-orange/80 hover:text-brand-orange';

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={`focus-ring flex flex-1 min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-1.5 min-h-[44px] transition-all rounded-xl ${
                isActive ? activeText : isHighlight ? highlightText : idleText
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive
                    ? isDarkSurface
                      ? 'bg-brand-orange/15'
                      : 'bg-brand-orange-50'
                    : isHighlight
                      ? isDarkSurface
                        ? 'bg-brand-orange/10 ring-1 ring-brand-orange/25'
                        : 'bg-brand-orange-50/80 ring-1 ring-brand-orange/20'
                      : ''
                }`}
              >
                <Icon aria-hidden="true" className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              </div>
              <span className="w-full text-center text-[10px] font-semibold leading-tight truncate">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
