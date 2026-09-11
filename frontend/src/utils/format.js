// Naira formatting shared across the app.
export const naira = (amount, opts = {}) => {
  const num = Number(amount) || 0;
  const formatted = new Intl.NumberFormat('en-NG', {
    maximumFractionDigits: opts.decimals ? 2 : 0,
  }).format(num);
  return opts.raw ? formatted : `₦${formatted}`;
};

export const nairaForInput = (amount) => (Number(amount) || 0).toLocaleString('en-NG');