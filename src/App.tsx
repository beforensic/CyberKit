import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ScrollToTop from './components/ScrollToTop';
import PageLoader from './components/PageLoader';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import QuizResults from './pages/QuizResults';
import Resources from './pages/Resources';
import Favorites from './pages/Favorites';
import Contact from './pages/Contact';
import TarteaucitronInit from './components/TarteaucitronInit';

const About = lazy(() => import('./pages/About'));
const Admin = lazy(() => import('./pages/Admin'));
const Legal = lazy(() => import('./pages/Legal'));

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function App() {
  return (
    <BrowserRouter>
      <TarteaucitronInit />
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="quiz/resultats" element={<QuizResults />} />
          <Route path="resources" element={<Resources />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="contact" element={<Contact />} />
          <Route
            path="about"
            element={
              <LazyPage>
                <About />
              </LazyPage>
            }
          />
        </Route>
        <Route
          path="admin"
          element={
            <LazyPage>
              <Admin />
            </LazyPage>
          }
        />
        <Route
          path="legal"
          element={
            <LazyPage>
              <Legal />
            </LazyPage>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
