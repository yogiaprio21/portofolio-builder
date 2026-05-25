import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import TemplatePreviewCard from '../../components/TemplatePreviewCard.jsx';

export default function TemplatePickerDialog({
  open,
  onClose,
  templates,
  visibleTemplates,
  templateCategories,
  templateCategory,
  setTemplateCategory,
  selectedId,
  templatePreviewCv,
  onSelectTemplate,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="mx-auto flex max-h-[calc(100vh-1.5rem)] max-w-6xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div>
            <h2 className="text-xl font-black">Pilih Template CV</h2>
            <p className="text-sm text-slate-500">
              Bandingkan preview sample, lalu pilih desain yang paling sesuai.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </div>
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {templateCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setTemplateCategory(category)}
                className={`min-h-9 shrink-0 rounded-full px-3 text-sm font-bold ${
                  templateCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {templates.length === 0 ? (
            <Alert tone="warning">Template belum tersedia.</Alert>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleTemplates.map((template) => (
                <TemplatePreviewCard
                  key={template.id}
                  template={template}
                  cv={templatePreviewCv(template)}
                  selected={template.id === selectedId}
                  onSelect={(nextTemplate) => {
                    onSelectTemplate(nextTemplate);
                    onClose();
                  }}
                  scale={0.21}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
