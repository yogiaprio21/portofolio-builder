import { AlertTriangle, LogOut, Trash2 } from 'lucide-react';
import { useEffect, useId, useMemo, useRef } from 'react';
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
  loading = false,
  type = 'default',
}) {
  const cancelRef = useRef(null);
  const previousFocusRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  const Icon = useMemo(() => {
    if (type === 'logout') return LogOut;
    if (danger || type === 'delete') return Trash2;
    return AlertTriangle;
  }, [danger, type]);

  useEffect(() => {
    if (!open) return undefined;
    previousFocusRef.current = document.activeElement;
    const timer = window.setTimeout(() => cancelRef.current?.focus(), 0);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) {
        event.preventDefault();
        onCancel?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [loading, onCancel, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-slate-950 shadow-2xl">
        <div
          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${danger ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}
        >
          <Icon aria-hidden="true" size={22} strokeWidth={2.4} />
        </div>
        <h2 id={titleId} className="text-xl font-black">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="mt-3 text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            ref={cancelRef}
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Memproses...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
