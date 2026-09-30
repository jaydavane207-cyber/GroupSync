export const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num || 0);
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount || 0);
};

export const formatXP = (xp) => {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k XP`;
  }
  return `${xp || 0} XP`;
};

export default { formatNumber, formatCurrency, formatXP };
