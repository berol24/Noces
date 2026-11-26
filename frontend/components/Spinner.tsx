export function PageLoader({ account = false }: { account?: boolean }) {
  return (
    <div className={account ? "spin-page spin-account" : "spin-page"} role="status" aria-live="polite">
      <div className="spin-mark" aria-hidden="true">
        <i />
        <i />
      </div>
      <span className="sr-only">Chargement</span>
    </div>
  );
}

export function ButtonSpinner() {
  return <span className="spin-dot" aria-hidden="true" />;
}
