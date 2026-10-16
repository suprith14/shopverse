// Placeholder for pages built in the next steps of Phase 5.
export function ComingSoon({ title, step }: { title: string; step: string }) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-slate-500">Coming in Phase 5, {step}.</p>
    </div>
  );
}
