export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="text-5xl" aria-hidden="true">📡</div>
      <div>
        <h1 className="text-xl font-bold text-text-primary mb-1">Nema interneta</h1>
        <p className="text-sm text-text-muted">
          Proverite vezu i pokušajte ponovo.
        </p>
      </div>
    </div>
  )
}
