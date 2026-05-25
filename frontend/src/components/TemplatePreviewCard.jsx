import { Suspense, lazy } from 'react';
import Badge from './ui/Badge.jsx';

const TemplateRenderer = lazy(() => import('../templates/TemplateRenderer'));

export default function TemplatePreviewCard({
  template,
  cv,
  selected,
  onSelect,
  scale = 0.25,
  compact = false,
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(template)}
      className={[
        'group text-left transition duration-200',
        'rounded-xl border bg-white p-3 shadow-sm hover:-translate-y-0.5 hover:shadow-xl',
        selected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-slate-200 hover:border-blue-200',
      ].join(' ')}
    >
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        <div className="h-56 bg-white">
          <div
            className="h-[760px] w-[920px] origin-top-left p-8"
            style={{ transform: `scale(${scale})` }}
          >
            <Suspense fallback={<div className="h-full w-full animate-pulse bg-slate-100" />}>
              <TemplateRenderer
                data={{ cv, theme: {} }}
                template={template}
                sectionsOrder={template.sections || []}
              />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold text-slate-950">{template.name}</div>
          <div className="mt-1 truncate text-xs text-slate-500">
            {template.category || 'Template'} · {template.metadata?.roleTarget || 'General'}
          </div>
        </div>
        {template.metadata?.isAtsSafe && <Badge tone="emerald">ATS</Badge>}
      </div>
      {!compact && template.metadata?.recommendedFor && (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {template.metadata.recommendedFor}
        </p>
      )}
    </button>
  );
}
