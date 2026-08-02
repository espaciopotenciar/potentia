export function LearningProgressBadge({ percent }: { percent: number }) {
  return (
    <div
      className="hidden md:flex items-center gap-2 rounded-full bg-potentia-sand px-3 py-1.5 text-xs font-medium text-potentia-deep"
      aria-label={`Progreso educativo general: ${percent} por ciento`}
    >
      <span className="relative h-2 w-20 overflow-hidden rounded-full bg-white">
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-potentia-lime transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </span>
      <span>{percent}% aprendido</span>
    </div>
  );
}
