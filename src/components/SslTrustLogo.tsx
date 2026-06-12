import { useEffect, useRef } from 'react';

const TRUST_LOGO_IMAGE = 'https://beforensic.be/wp-content/uploads/sectigo.png';

declare global {
  interface Window {
    TrustLogo?: (imageUrl: string, type: string, display: string) => void;
  }
}

export default function SslTrustLogo() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tlJsHost =
      window.location.protocol === 'https:'
        ? 'https://secure.trust-provider.com/'
        : 'http://www.trustlogo.com/';

    const script = document.createElement('script');
    script.src = `${tlJsHost}trustlogo/javascript/trustlogo.js`;
    script.async = true;
    script.onload = () => {
      window.TrustLogo?.(TRUST_LOGO_IMAGE, 'SC5', 'none');
    };
    container.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div ref={containerRef} className="flex justify-center min-h-[54px]">
      <a href="https://www.instantssl.com" id="comodoTL" className="comodo-tl">
        SSL Certificate
      </a>
    </div>
  );
}
