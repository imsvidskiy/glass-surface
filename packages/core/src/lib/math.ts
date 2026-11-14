export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

export function approximateNormalCdf(value: number): number {
  return 1 / (1 + Math.exp(-1.702 * value));
}
