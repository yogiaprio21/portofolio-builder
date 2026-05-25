import { Suspense, createElement } from 'react';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import SectionOrderControl from './SectionOrderControl.jsx';
import ThemeControls from './ThemeControls.jsx';

export default function PreviewPanel({
  TemplateRenderer: Renderer,
  previewCv,
  theme,
  selectedTemplate,
  sectionsOrder,
  previewMode,
  setPreviewMode,
  previewWidth,
  stepLabels,
  dragKey,
  onDragStart,
  onDrop,
  setTheme,
  fontOptions,
  onSubmit,
}) {
  return (
    <aside className="space-y-4 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-auto xl:pr-1">
      <section className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge tone={selectedTemplate ? 'emerald' : 'amber'}>
              {selectedTemplate ? 'Preview aktif' : 'Pilih template'}
            </Badge>
            <h2 className="mt-3 text-lg font-black">Preview CV</h2>
            <p className="text-xs leading-relaxed text-slate-500">
              {selectedTemplate
                ? `${selectedTemplate.name} - ${selectedTemplate.category || 'Template'}`
                : 'Preview akan memakai template setelah dipilih.'}
            </p>
          </div>
        </div>
        <div className="mb-3 grid grid-cols-3 gap-2">
          {['web', 'pdf', 'mobile'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPreviewMode(mode)}
              className={`min-h-9 rounded-lg text-xs font-bold ${
                previewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="max-h-[46vh] overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-3 shadow-inner xl:max-h-[calc(100vh-22rem)]">
          <div className={`mx-auto rounded-lg bg-white p-5 ${previewWidth}`}>
            <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-slate-100" />}>
              {createElement(Renderer, {
                data: { cv: previewCv, theme },
                template: selectedTemplate || {},
                sectionsOrder,
              })}
            </Suspense>
          </div>
        </div>
        <Button type="button" onClick={onSubmit} className="mt-4 w-full">
          Simpan & Preview Penuh
        </Button>
      </section>

      <details className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-black text-slate-900">
          Tampilan & section
        </summary>
        <div className="mt-4 space-y-5">
          <div>
            <h3 className="mb-2 text-sm font-black">Kustomisasi</h3>
            <ThemeControls theme={theme} setTheme={setTheme} fontOptions={fontOptions} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-black">Urutan Section</h3>
            <SectionOrderControl
              sectionsOrder={sectionsOrder}
              stepLabels={stepLabels}
              dragKey={dragKey}
              onDragStart={onDragStart}
              onDrop={onDrop}
            />
          </div>
        </div>
      </details>
    </aside>
  );
}
