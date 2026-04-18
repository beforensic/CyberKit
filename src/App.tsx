import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Resources from './pages/Resources';
import Contact from './pages/Contact';
import About from './pages/About';
import Admin from './pages/Admin';
import Legal from './pages/Legal';
import Favorites from './pages/Favorites';

// Définition des pages disponibles (uniquement public et admin)
type Page = 'home' | 'quiz' | 'resources' | 'contact' | 'about' | 'admin' | 'legal' | 'favorites';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [resourceFilter, setResourceFilter] = useState<string | undefined>(undefined);
  const [contactSubject, setContactSubject] = useState<string>('');
  const [resourcesKey, setResourcesKey] = useState(0);

  // Gestion du routage basique pour l'admin
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setCurrentPage('admin');
    }
  }, []);

  // Fonction de navigation globale
  const handleNavigate = (page: Page, filter?: string, contactData?: { subject?: string }) => {
    setCurrentPage(page);

    if (page === 'resources' && filter) {
      setResourceFilter(filter);
    } else {
      setResourceFilter(undefined);
    }

    // Force le rafraîchissement des ressources si on clique sur le menu
    if (page === 'resources') {
      setResourcesKey(prev => prev + 1);
    }

    // Pré-remplissage du sujet de contact si besoin
    if (page === 'contact' && contactData?.subject) {
      setContactSubject(contactData.subject);
    } else if (page !== 'contact') {
      setContactSubject('');
    }

    // Mise à jour de l'URL sans recharger la page
    const newPath = page === 'admin' ? '/admin' : '/';
    window.history.pushState({}, '', newPath);

    // Retour en haut de page
    window.scrollTo(0, 0);
  };

  // Rendu conditionnel de la page active
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'quiz':
        return <Quiz onNavigate={handleNavigate} />;
      case 'resources':
        return <Resources key={resourcesKey} initialFilter={resourceFilter} onNavigate={handleNavigate} />;
      case 'favorites':
        return <Favorites onNavigate={handleNavigate} />;
      case 'contact':
        return <Contact onNavigate={handleNavigate} initialSubject={contactSubject} />;
      case 'about':
        return <About onNavigate={handleNavigate} />;
      case 'admin':
        return <Admin onNavigate={handleNavigate} />;
      case 'legal':
        return <Legal onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  // Masquer la barre de navigation sur les pages de gestion
  const hideNavigation = ['admin', 'legal'].includes(currentPage);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <main>
        {renderPage()}
      </main>

      {!hideNavigation && (
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      )}
    </div>
  );
}

export default App;