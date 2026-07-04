export default function StopBadge({ index, total }: { index: number; total: number }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="font-mono text-[11px] text-ink-faint">
        STOP <span className="text-signal">{String(index).padStart(2, "0")}</span> / {String(total).padStart(2, "0")}
      </div>
      <div className="hairline flex-1" />
    </div>
  );
}
