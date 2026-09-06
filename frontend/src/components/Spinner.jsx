const Spinner = ({ label = 'Loading...', className = '' }) => {
  return (
    <div className={`flex min-h-[40vh] flex-col items-center justify-center gap-3 ${className}`}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
      {label && <p className="text-sm font-medium text-slate-400">{label}</p>}
    </div>
  );
};

export default Spinner;
export { Spinner };