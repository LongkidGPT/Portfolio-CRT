const WIDTH_PROFILE = [168, 122, 80, 50, 32] as const;

export function rulerWidthsForIndex(
  projectIndex: number | null,
  _side: "left" | "right",
): number[] {
  if (projectIndex === null) {
    return Array.from({ length: 9 }, () => 18);
  }

  const clampedIndex = Math.min(4, Math.max(0, projectIndex));
  const peak = 2 + clampedIndex;

  return Array.from({ length: 9 }, (_, lineIndex) => {
    const distance = Math.min(4, Math.abs(lineIndex - peak));
    return WIDTH_PROFILE[distance];
  });
}
