import Button from './Button.jsx';
import { Link } from 'react-router-dom';

export default function EmptyState({ title, description, actionLabel, onAction, actionTo }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/15 text-xl text-blue-200">
        +
      </div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/60">{description}</p>}
      {actionLabel && (
        <Button
          as={actionTo ? Link : 'button'}
          to={actionTo}
          onClick={onAction}
          className="mt-5"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
