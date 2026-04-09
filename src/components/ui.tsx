import React from 'react';
import { X, Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary:   'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-950/50 border border-violet-500/30',
  secondary: 'bg-white/5 hover:bg-white/9 text-slate-300 border border-white/10 hover:border-white/18',
  danger:    'bg-red-500/12 hover:bg-red-500/22 text-red-400 border border-red-500/22 hover:border-red-500/38',
  success:   'bg-emerald-500/12 hover:bg-emerald-500/22 text-emerald-400 border border-emerald-500/22',
  ghost:     'hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-5 py-3 text-base rounded-xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, loading = false, disabled, children, className = '', ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        ${variantClasses[variant]} ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        inline-flex items-center justify-center gap-2
        font-semibold transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {loading ? <><Loader2 size={14} className="animate-spin" />{children}</> : children}
    </button>
  )
);
Button.displayName = 'Button';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, icon, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>}
        <input
          ref={ref}
          className={`input-dark ${icon ? 'pl-9' : ''} ${error ? '!border-red-500/50 focus:!shadow-red-500/12' : ''} ${className}`}
          {...props}
        />
      </div>
      {error    && <p className="text-xs text-red-400">{error}</p>}
      {helpText && !error && <p className="text-xs text-slate-500">{helpText}</p>}
    </div>
  )
);
Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>}
      <select
        ref={ref}
        className={`input-dark ${error ? '!border-red-500/50' : ''} ${className}`}
        style={{ colorScheme: 'dark' }}
        {...props}
      >
        <option value="">Pilih opsi...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Dialog = ({ open, onOpenChange, title, children, className = '' }: DialogProps) => {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-40 animate-fade-in" onClick={() => onOpenChange(false)} />
      <div className={`
        fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
        w-[calc(100%-2rem)] max-w-md max-h-[90dvh] overflow-y-auto
        bg-[#090e1a]/98 border border-white/10 rounded-2xl shadow-2xl shadow-black/70
        animate-fade-up
        ${className}
      `}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/07 sticky top-0 bg-[#090e1a]/98 backdrop-blur-sm z-10">
          <h2 className="text-base font-bold text-slate-100">{title}</h2>
          <button onClick={() => onOpenChange(false)} className="p-1.5 hover:bg-white/8 rounded-lg transition-colors text-slate-400 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>}
      <textarea
        ref={ref}
        className={`input-dark resize-none ${error ? '!border-red-500/50' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';

interface BadgeProps {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'purple';
  children: React.ReactNode;
}

export const Badge = ({ variant = 'default', children }: BadgeProps) => {
  const cls: Record<string, string> = {
    default: 'bg-slate-700/50 text-slate-300 border border-slate-600/40',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    danger:  'bg-red-500/10 text-red-400 border border-red-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    purple:  'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls[variant]}`}>
      {children}
    </span>
  );
};
