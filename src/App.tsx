import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import QuizResults from './pages/QuizResults';
import Resources from './pages/Resources';
import Favorites from './pages/Favorites';
import Contact from './pages/Contact';
import About from './pages/About';
import Admin from './pages/Admin';
import Legal from './pages/Legal';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="quiz/resultats" element={<QuizResults />} />
          <Route path="resources" element={<Resources />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<About />} />
        </Route>
        <Route path="admin" element={<Admin />} />
        <Route path="legal" element={<Legal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
