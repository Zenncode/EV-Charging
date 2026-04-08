export function formatCurrency(value: number, currency = "PHP", locale = "en-PH") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}
