export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-potentia-muted">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progreso"}
        className="h-2 w-full overflow-hidden rounded-full bg-potentia-sand"
      >
        <div
          className="h-full rounded-full bg-potentia-lime transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
