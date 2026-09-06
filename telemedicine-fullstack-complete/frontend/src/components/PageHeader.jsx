const Avatar = ({ name, className = '' }) => {
  const initials = (name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const palette = [
    'from-teal-500 to-cyan-600',
    'from-brand-500 to-indigo-500',
    'from-rose-400 to-orange-400',
    'from-mint-500 to-teal-500',
    'from-violet-500 to-purple-600',
    'from-amber-400 to-orange-500',
  ];
  const hash = (name || '?')
    .split('')
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  const tint = palette[hash % palette.length];
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${tint} font-display text-sm font-bold text-white shadow-sm ring-2 ring-white ${className}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
};

const PageHeader = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  className = '',
}) => (
  <div className={`mb-8 ${className}`}>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {Icon && (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-700 text-white shadow-lg shadow-cyan-500/25">
            <Icon size={24} />
          </span>
        )}
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  </div>
);

export default PageHeader;
export { Avatar };