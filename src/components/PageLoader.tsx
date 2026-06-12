export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light" role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-orange" aria-hidden="true" />
      <span className="sr-only">Chargement de la page</span>
    </div>
  );
}
