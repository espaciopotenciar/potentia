export function LocalStorageNotice({ text }: { text?: string }) {
  return (
    <p className="text-xs text-potentia-muted">
      {text ??
        "Tu progreso se guarda en este navegador. Si cambiás de dispositivo o eliminás los datos de navegación, podría perderse."}
    </p>
  );
}
