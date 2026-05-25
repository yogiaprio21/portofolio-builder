import { Suspense, lazy } from 'react';
import Badge from './ui/Badge.jsx';
import { resolveText } from '../shared/lib/text.js';

const TemplateRenderer = lazy(() => import('../templates/TemplateRenderer'));

function MiniCvPoster({ template, cv }) {
  const name = cv?.personal?.fullName || 'General Candidate';
  const headline = cv?.personal?.headline || template?.metadata?.roleTarget || 'Professional CV';
  const summary = resolveText(cv?.summary, 'id') || 'Ringkasan profesional dengan struktur rapi.';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-inner sm:hidden">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="min-w-0">
          <div className="truncate text-base font-black text-slate-950">{name}</div>
          <div className="mt-1 truncate text-xs font-semibold text-blue-700">{headline}</div>
        </div>
        <div className="h-9 w-9 shrink-0 rounded-lg bg-blue-100" />
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-2 h-2 w-20 rounded bg-slate-900" />
          <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-500">{summary}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-2 rounded bg-slate-200" />
          <div className="h-2 rounded bg-slate-200" />
          <div className="h-2 rounded bg-slate-200" />
          <div className="h-2 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function TemplatePreviewCard({
  template,
  cv,
  selected,
  onSelect,
  scale = 0.25,
  compact = false,
  previewClassName = 'h-48',
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(template)}
      className={[
        'group w-full text-left transition duration-200',
        compact
          ? 'rounded-xl border bg-white p-2 shadow-sm hover:-translate-y-0.5 hover:shadow-lg'
          : 'rounded-xl border bg-white p-3 shadow-sm hover:-translate-y-0.5 hover:shadow-lg',
        selected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-slate-200 hover:border-blue-200',
      ].join(' ')}
    >
      <MiniCvPoster template={template} cv={cv} />
      <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-slate-100 sm:block">
        <div className={`${previewClassName} bg-white`}>
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
      <div
        className={
          compact
            ? 'mt-3 flex items-start justify-between gap-3'
            : 'mt-4 flex items-start justify-between gap-3'
        }
      >
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
