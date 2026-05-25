import { createElement } from 'react';

const variants = {
  primary:
    'bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-500 focus:ring-blue-300',
  secondary:
    'border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 focus:ring-blue-300',
  subtle:
    'border border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-blue-300',
  dark: 'border border-white/10 bg-white/10 text-white hover:bg-white/15 focus:ring-white/30',
  light: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus:ring-blue-300',
  danger: 'bg-red-600 text-white shadow-sm shadow-red-600/20 hover:bg-red-500 focus:ring-red-300',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus:ring-blue-300',
  ghostDark: 'text-white/75 hover:bg-white/10 hover:text-white focus:ring-white/30',
};

const sizes = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
};

export default function Button({
  as = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  ...props
}) {
  return createElement(
    as,
    {
      disabled,
      className: [
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        disabled ? 'cursor-not-allowed opacity-60' : '',
        className,
      ].join(' '),
      ...props,
    },
    children,
  );
}
