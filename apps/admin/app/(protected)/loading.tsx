export default function ProtectedSectionLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading section">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-56 rounded-lg bg-black/[0.08]" />
          <div className="h-4 w-80 max-w-full rounded-md bg-black/[0.05]" />
        </div>
        <div className="h-9 w-32 rounded-xl bg-black/[0.08]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white/80 border border-black/[0.06] p-6 space-y-3"
          >
            <div className="h-3 w-24 rounded bg-black/[0.06]" />
            <div className="h-8 w-16 rounded bg-black/[0.09]" />
          </div>
        ))}
      </div>

      <div className="h-80 rounded-2xl bg-white/80 border border-black/[0.06] p-6 space-y-4">
        <div className="h-5 w-44 rounded bg-black/[0.07]" />
        <div className="h-56 w-full rounded-xl bg-black/[0.04]" />
      </div>
    </div>
  );
}
