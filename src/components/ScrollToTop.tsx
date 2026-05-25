import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const main = document.getElementById('main-content');
    main?.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}
