import Button from './Button.jsx';
import { Link } from 'react-router-dom';

export default function EmptyState({ title, description, actionLabel, onAction, actionTo }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-xl font-black text-blue-700">
        +
      </div>
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      )}
      {actionLabel && (
        <Button as={actionTo ? Link : 'button'} to={actionTo} onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
