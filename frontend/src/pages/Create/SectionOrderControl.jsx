export default function SectionOrderControl({
  sectionsOrder,
  stepLabels,
  dragKey,
  onDragStart,
  onDrop,
  compact = false,
}) {
  return (
    <div className="grid gap-2">
      {sectionsOrder.map((key) => (
        <div
          key={key}
          draggable
          onDragStart={() => onDragStart(key)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => onDrop(key)}
          className={`cursor-move rounded-lg border font-semibold transition ${
            compact ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'
          } ${
            dragKey === key
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50'
          }`}
        >
          {stepLabels[key] || key}
        </div>
      ))}
    </div>
  );
}
