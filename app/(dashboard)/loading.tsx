export default function DashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-40 rounded-lg bg-muted" />
          <div className="h-4 w-56 rounded-lg bg-muted/70" />
        </div>
        <div className="h-8 w-24 rounded-lg bg-muted" />
      </div>
      <div className="h-10 w-full rounded-xl bg-muted/60" />
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-0">
            <div className="h-4 w-6 rounded bg-muted/60" />
            <div className="h-4 flex-1 rounded bg-muted/60" />
            <div className="h-4 w-24 rounded bg-muted/60" />
            <div className="h-5 w-16 rounded-full bg-muted/60" />
            <div className="h-6 w-6 rounded bg-muted/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
