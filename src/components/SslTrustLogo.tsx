const TRUST_LOGO_IMAGE = 'https://beforensic.be/wp-content/uploads/sectigo.png';

export default function SslTrustLogo() {
  return (
    <div className="flex justify-center min-h-[54px] items-center">
      <a
        href="https://www.instantssl.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block focus-ring rounded-lg"
      >
        <img
          src={TRUST_LOGO_IMAGE}
          alt="Secured by Sectigo"
          width={132}
          height={48}
          className="h-12 w-auto"
          loading="lazy"
          decoding="async"
        />
      </a>
    </div>
  );
}
