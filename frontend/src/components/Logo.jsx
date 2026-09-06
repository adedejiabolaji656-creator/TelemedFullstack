import { Link } from 'react-router-dom';

const GID = 'telemed-mark-gradient';

export const Mark = ({ size = 36, className = '' }) => (
  <svg
    viewBox="0 0 48 48"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id={GID} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#2dd4bf" />
        <stop offset="0.55" stopColor="#0891b2" />
        <stop offset="1" stopColor="#0e7490" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="44" height="44" rx="14" fill={`url(#${GID})`} />
    <path
      d="M16 2h16a14 14 0 0 1 14 14v4H2v-4A14 14 0 0 1 16 2z"
      fill="rgba(255,255,255,0.18)"
    />
    <rect x="21.25" y="9" width="5.5" height="30" rx="2.75" fill="#fff" />
    <rect x="8" y="21.25" width="13.25" height="5.5" rx="2.75" fill="#fff" />
    <path
      d="M27 24h4.6l1.8-8 2.2 16 1.8-8h2.6"
      stroke="#fff"
      strokeWidth="5.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const Wordmark = ({ light = false, className = '' }) => (
  <span
    className={`font-display text-xl font-extrabold tracking-tight ${
      light ? 'text-white' : 'text-slate-900'
    } ${className}`}
  >
    Tele<span className="gradient-text">Med</span>
  </span>
);

const Logo = ({
  size = 36,
  light = false,
  showWordmark = true,
  to = '/',
  className = '',
  markClassName = '',
  wordmarkClassName = '',
}) => {
  const content = (
    <>
      <span
        className="inline-flex shrink-0 transition-transform duration-300 group-hover:scale-[1.04] group-hover:-rotate-3"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(8, 145, 178, 0.35))' }}
      >
        <Mark size={size} className={markClassName} />
      </span>
      {showWordmark && <Wordmark light={light} className={wordmarkClassName} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`group flex items-center gap-2.5 ${className}`}>
        {content}
      </Link>
    );
  }

  return <span className={`flex items-center gap-2.5 ${className}`}>{content}</span>;
};

export default Logo;