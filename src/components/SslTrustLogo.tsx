const TRUST_LOGO_IMAGE = '/sectigo-trust-seal.svg';

export default function SslTrustLogo() {
  return (
    <div className="flex justify-center min-h-[54px] items-center">
      <a
        href="https://www.instantssl.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block focus-ring rounded-lg"
        title="Secured by Sectigo"
      >
        <img
          src={TRUST_LOGO_IMAGE}
          alt="Secured by Sectigo"
          width={140}
          height={54}
          className="h-12 w-auto"
          loading="lazy"
          decoding="async"
        />
      </a>
    </div>
  );
}
