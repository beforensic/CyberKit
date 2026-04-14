import { useState, useEffect } from 'react';
import { Home, ClipboardList, Library, Mail, User, Heart, Building2 } from 'lucide-react';
import { getFavorites } from '../utils/storage';
import { useProgress } from '../contexts/ProgressContext';
import { supabase } from '../lib/supabase';

interface NavigationProps {
  currentPage: 'home' | 'quiz' | 'resources' | 'favorites' | 'contact' | 'company-plans';
  onNavigate: (page: 'home' | 'quiz' | 'resources' | 'favorites' | 'contact' | 'about' | 'company-plans') => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [companyRole, setCompanyRole] = useState<'admin' | 'member' | null>(null);
  const { getConsultedCount } = useProgress();

  useEffect(() => {
    const updateFavoritesCount = () => {
      const favorites = getFavorites();
      setFavoritesCount(favorites.length);
    };

    updateFavoritesCount();

    const interval = setInterval(updateFavoritesCount, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    checkCompanyRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkCompanyRole();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkCompanyRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setCompanyRole(null);
        return;
      }

      const { data: member } = await supabase
        .from('company_members')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (member?.role) {
        setCompanyRole(member.role as 'admin' | 'member');
      } else {
        setCompanyRole(null);
      }
    } catch (error) {
      console.error('Erreur vérification rôle:', error);
      setCompanyRole(null);
    }
  };

  const consultedCount = getConsultedCount();

  const getCompanyNavLabel = () => {
    if (companyRole === 'admin') return 'Tableau de bord';
    if (companyRole === 'member') return 'Mon espace';
    return 'Entreprise';
  };

  const handleCompanyClick = () => {
    if (companyRole === 'admin') {
      onNavigate('home');
      setTimeout(() => {
        window.location.href = '/entreprise/dashboard';
      }, 0);
    } else if (companyRole === 'member') {
      onNavigate('home');
      setTimeout(() => {
        window.location.href = '/entreprise/membre';
      }, 0);
    } else {
      onNavigate('company-plans');
    }
  };

  const navItemsBefore = [
    { id: 'home' as const, label: 'Accueil', icon: Home },
    { id: 'quiz' as const, label: 'Diagnostic', icon: ClipboardList },
    { id: 'resources' as const, label: 'Ressources', icon: Library, badge: consultedCount, badgeColor: 'bg-emerald-500' }
  ];

  const navItemsAfter = [
    { id: 'favorites' as const, label: 'Favoris', icon: Heart, badge: favoritesCount, badgeColor: 'bg-[#E8650A]' },
    { id: 'about' as const, label: 'À propos', icon: User },
    { id: 'contact' as const, label: 'Contact', icon: Mail }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-xl z-50">
      <div className="flex justify-around items-center h-16 max-w-screen-sm mx-auto px-1">
        {navItemsBefore.map(({ id, label, icon: Icon, badge, badgeColor }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${
              currentPage === id
                ? 'text-primary'
                : 'text-slate-500 hover:text-primary-400'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5" />
              {badge !== undefined && badge > 0 && (
                <span className={`absolute -top-1 -right-2 ${badgeColor || 'bg-emerald-500'} text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center`}>
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-medium leading-tight">{label}</span>
          </button>
        ))}

        <button
          onClick={handleCompanyClick}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${
            currentPage === 'company-plans'
              ? 'text-primary'
              : 'text-slate-500 hover:text-primary-400'
          }`}
        >
          <div className="relative">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5" />
          </div>
          <span className="text-[10px] sm:text-xs font-medium leading-tight">{getCompanyNavLabel()}</span>
        </button>

        {navItemsAfter.map(({ id, label, icon: Icon, badge, badgeColor }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${
              currentPage === id
                ? 'text-primary'
                : 'text-slate-500 hover:text-primary-400'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5" />
              {badge !== undefined && badge > 0 && (
                <span className={`absolute -top-1 -right-2 ${badgeColor || 'bg-emerald-500'} text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center`}>
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-medium leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
