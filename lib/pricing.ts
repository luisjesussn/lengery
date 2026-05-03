const FACTOR_DOLAR = 620 / 500;

export function calculateFinalPriceUSD(costUSD: number, marginPct: number): number {
  const adjustedCost = costUSD * FACTOR_DOLAR;
  return adjustedCost * (1 + marginPct);
}

export function formatARS(usd: number, blueRate: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(usd * blueRate);
}

export function formatUSD(usd: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(usd);
}
