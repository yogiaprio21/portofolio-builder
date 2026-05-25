import Button from './Button.jsx';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
  danger = false,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-slate-950 shadow-2xl">
        <div
          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${danger ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'} text-xl font-black`}
        >
          !
        </div>
        <h2 id="confirm-dialog-title" className="text-xl font-black">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
