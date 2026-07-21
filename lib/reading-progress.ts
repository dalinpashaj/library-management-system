export function computeProgressPercent(
  currentPage: number | null | undefined,
  totalPages: number | null | undefined
): number | null {
  if (totalPages == null || totalPages <= 0) return null;
  const current = currentPage ?? 0;
  return (current / totalPages) * 100;
}

export function detectHalfwayMilestone(
  oldCurrentPage: number | null | undefined,
  oldTotalPages: number | null | undefined,
  newCurrentPage: number | null | undefined,
  newTotalPages: number | null | undefined
): "halfway" | undefined {
  const oldPct = computeProgressPercent(oldCurrentPage, oldTotalPages);
  const newPct = computeProgressPercent(newCurrentPage, newTotalPages);

  if (oldPct !== null && newPct !== null && oldPct < 50 && newPct >= 50) {
    return "halfway";
  }
  return undefined;
}
