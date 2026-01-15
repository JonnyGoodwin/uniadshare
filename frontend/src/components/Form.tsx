type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string };

export function TextInput({ label, ...props }: InputProps) {
  return (
    <label className="block text-sm font-medium text-slate-700 mb-2">
      <span className="block mb-1">{label}</span>
      <input
        {...props}
        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
    </label>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' };

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  const base = 'inline-flex items-center rounded px-4 py-2 text-sm font-semibold focus:outline-none';
  const variants: Record<string, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    ghost: 'bg-transparent text-indigo-700 hover:bg-indigo-50'
  };
  return <button {...props} className={`${base} ${variants[variant]} ${props.className ?? ''}`} />;
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}
