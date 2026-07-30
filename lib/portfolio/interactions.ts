const WIDTH_PROFILE = [168, 122, 80, 50, 32] as const;

export function rulerWidthsForIndex(
  projectIndex: number,
  side: "left" | "right",
): number[] {
  const clampedIndex = Math.min(4, Math.max(0, projectIndex));
  const leftPeak = 2 + clampedIndex;
  const peak = side === "left" ? leftPeak : 8 - leftPeak;

  return Array.from({ length: 9 }, (_, lineIndex) => {
    const distance = Math.min(4, Math.abs(lineIndex - peak));
    return WIDTH_PROFILE[distance];
  });
}
