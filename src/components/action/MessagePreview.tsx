import { CopyButton } from "@/components/shared/CopyButton";

export function MessagePreview({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-potentia-sand bg-potentia-cream p-4">
      <p className="whitespace-pre-line text-sm leading-relaxed text-potentia-ink">{text}</p>
      <div className="mt-4">
        <CopyButton text={text} />
      </div>
    </div>
  );
}
