import { Home, ClipboardList, BookOpen, Mail, Star } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Accueil', icon: Home, end: true },
  { path: '/quiz', label: 'Diagnostic', icon: ClipboardList, end: false },
  { path: '/resources', label: 'Ressources', icon: BookOpen, end: false },
  { path: '/favorites', label: 'Favoris', icon: Star, end: false },
  { path: '/contact', label: 'Contact', icon: Mail, end: false, highlight: true },
];

export default function Navigation() {
  const { pathname } = useLocation();

  const isQuizActive = pathname === '/quiz' || pathname.startsWith('/quiz/');

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-3 py-2 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="max-w-lg mx-auto flex justify-between items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/quiz' ? isQuizActive : (
            item.end ? pathname === item.path : pathname.startsWith(item.path)
          );
          const isHighlight = item.highlight && !isActive;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={`flex flex-col items-center gap-1 p-2 transition-all rounded-xl ${
                isActive
                  ? 'text-brand-orange'
                  : isHighlight
                    ? 'text-brand-orange/80 hover:text-brand-orange'
                    : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-brand-orange-50'
                    : isHighlight
                      ? 'bg-brand-orange-50/80 ring-1 ring-brand-orange/20'
                      : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              </div>
              <span
                className={`text-[9px] font-black uppercase tracking-wider ${
                  isActive || isHighlight ? 'opacity-100' : 'opacity-70'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
