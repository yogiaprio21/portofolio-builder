import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';

export default function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
  className = '',
  describedBy,
  invalid = false,
  required = false,
}) {
  const generatedId = useId();
  const inputId = id || `password-${generatedId}`;
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <input
        id={inputId}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy || undefined}
        className={`field-control pr-12 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
        aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
        aria-controls={inputId}
        aria-pressed={visible}
      >
        <Icon aria-hidden="true" size={18} strokeWidth={2.2} />
      </button>
    </div>
  );
}

