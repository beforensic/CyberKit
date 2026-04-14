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
import CompanyPlans from './pages/CompanyPlans';
import CompanySignup from './pages/CompanySignup';
import CompanyLogin from './pages/CompanyLogin';
import CompanyJoin from './pages/CompanyJoin';
import CompanyDashboard from './pages/CompanyDashboard';
import CompanyMembers from './pages/CompanyMembers';
import CompanyMember from './pages/CompanyMember';

type Page = 'home' | 'quiz' | 'resources' | 'contact' | 'about' | 'admin' | 'legal' | 'favorites' | 'company-plans' | 'company-signup' | 'company-login' | 'company-join' | 'company-dashboard' | 'company-members' | 'company-member';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [resourceFilter, setResourceFilter] = useState<string | undefined>(undefined);
  const [invitationCode, setInvitationCode] = useState<string>('');
  const [contactSubject, setContactSubject] = useState<string>('');
  const [resourcesKey, setResourcesKey] = useState(0);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setCurrentPage('admin');
    } else if (path.startsWith('/entreprise/rejoindre/')) {
      const code = path.split('/').pop() || '';
      setInvitationCode(code);
      setCurrentPage('company-join');
    } else if (path === '/entreprise' || path === '/entreprise/') {
      setCurrentPage('company-plans');
    } else if (path === '/entreprise/inscription') {
      setCurrentPage('company-signup');
    } else if (path === '/entreprise/connexion') {
      setCurrentPage('company-login');
    } else if (path === '/entreprise/dashboard') {
      setCurrentPage('company-dashboard');
    } else if (path === '/entreprise/membres') {
      setCurrentPage('company-members');
    } else if (path === '/entreprise/membre') {
      setCurrentPage('company-member');
    }
  }, []);

  const handleNavigate = (page: Page, filter?: string, contactData?: { subject?: string }) => {
    setCurrentPage(page);
    if (page === 'resources' && filter) {
      setResourceFilter(filter);
    } else {
      setResourceFilter(undefined);
    }

    if (page === 'resources') {
      setResourcesKey(prev => prev + 1);
    }

    if (page === 'contact' && contactData?.subject) {
      setContactSubject(contactData.subject);
    } else if (page !== 'contact') {
      setContactSubject('');
    }

    if (page === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (page === 'company-plans') {
      window.history.pushState({}, '', '/entreprise');
    } else if (page === 'company-signup') {
      window.history.pushState({}, '', '/entreprise/inscription');
    } else if (page === 'company-login') {
      window.history.pushState({}, '', '/entreprise/connexion');
    } else if (page === 'company-dashboard') {
      window.history.pushState({}, '', '/entreprise/dashboard');
    } else if (page === 'company-members') {
      window.history.pushState({}, '', '/entreprise/membres');
    } else if (page === 'company-member') {
      window.history.pushState({}, '', '/entreprise/membre');
    } else {
      window.history.pushState({}, '', '/');
    }

    window.scrollTo(0, 0);
  };

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
      case 'company-plans':
        return <CompanyPlans onNavigate={handleNavigate} />;
      case 'company-signup':
        return <CompanySignup onNavigate={handleNavigate} />;
      case 'company-login':
        return <CompanyLogin onNavigate={handleNavigate} />;
      case 'company-join':
        return <CompanyJoin invitationCode={invitationCode} onNavigate={handleNavigate} />;
      case 'company-dashboard':
        return <CompanyDashboard onNavigate={handleNavigate} />;
      case 'company-members':
        return <CompanyMembers onNavigate={handleNavigate} />;
      case 'company-member':
        return <CompanyMember onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  const hideNavigation = currentPage === 'admin' ||
                        currentPage === 'legal' ||
                        currentPage === 'company-plans' ||
                        currentPage === 'company-signup' ||
                        currentPage === 'company-login' ||
                        currentPage === 'company-join' ||
                        currentPage === 'company-dashboard' ||
                        currentPage === 'company-member';

  return (
    <div className="min-h-screen">
      {renderPage()}
      {!hideNavigation && (
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      )}
    </div>
  );
}

export default App;
