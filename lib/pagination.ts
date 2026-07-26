export function parsePaginationInt(
  value: string | null | undefined,
  fallback: number,
  { min = 1, max }: { min?: number; max?: number } = {}
): number {
  const parsed = parseInt(value ?? "", 10);
  let result = Number.isFinite(parsed) ? parsed : fallback;
  result = Math.max(min, result);
  if (max != null) result = Math.min(max, result);
  return result;
}
