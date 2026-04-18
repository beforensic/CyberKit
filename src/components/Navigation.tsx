import { Home, ClipboardList, BookOpen, User, Mail, Star, Lock } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: any) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'quiz', label: 'Diagnostic', icon: ClipboardList },
    { id: 'resources', label: 'Ressources', icon: BookOpen },
    { id: 'favorites', label: 'Favoris', icon: Star },
    { id: 'contact', label: 'Contact', icon: Mail },
    // Lien Admin ajouté pour ton accès
    { id: 'admin', label: 'Admin', icon: Lock },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive
                  ? 'text-[#E8650A]'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-orange-50' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}