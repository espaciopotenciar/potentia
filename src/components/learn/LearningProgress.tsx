import { ProgressBar } from "@/components/shared/ProgressBar";

export function LearningProgress({
  completedCount,
  totalCount,
}: {
  completedCount: number;
  totalCount: number;
}) {
  const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="rounded-2xl border border-potentia-sand bg-white p-6 shadow-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-potentia-ink">Tu avance general</h2>
          <p className="mt-1 text-sm text-potentia-muted">
            {completedCount} de {totalCount} lecciones completadas
          </p>
        </div>
        <div className="w-full md:w-64">
          <ProgressBar value={percent} />
        </div>
      </div>
      <p className="mt-4 text-xs text-potentia-muted">
        Tu progreso queda guardado en tu cuenta — lo vas a ver igual si entrás desde
        otro dispositivo.
      </p>
    </div>
  );
}
