/**
 * Format a number as a currency string.
 * @example formatCurrency(1234.5) // "₹1,234.50"
 */
export function formatCurrency(amount: number, symbol = '₹'): string {
  return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}
