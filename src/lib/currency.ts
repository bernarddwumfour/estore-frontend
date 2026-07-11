export const DEFAULT_CURRENCY_CODE = "GHS";
export const DEFAULT_CURRENCY_LOCALE = "en-GH";

type CurrencyValue = number | string | null | undefined;

function toNumber(amount: CurrencyValue) {
  if (typeof amount === "number") {
    return Number.isFinite(amount) ? amount : 0;
  }

  const parsed = Number(amount ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(
  amount: CurrencyValue,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(DEFAULT_CURRENCY_LOCALE, {
    style: "currency",
    currency: DEFAULT_CURRENCY_CODE,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(toNumber(amount));
}
