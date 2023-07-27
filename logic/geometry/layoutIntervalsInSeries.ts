/**
 * Given a series of intervals, lay them out in a row, with a given gap between
 * each interval. If padding is specified, the first and last intervals will be
 * offset from the start and end of the row by the given amount. Otherwise, the
 * gap will be used as padding.
 *
 * @param intervalSizes
 * @param gap
 * @param padding
 */
export default function layoutIntervalsInSeries(
  intervalSizes: number[],
  gap: number,
  padding: number | undefined = undefined,
  center: boolean = true
): {
  intervals: { left: number; center: number; right: number; size: number }[];
  totalSize: number;
} {
  if (padding == null) {
    padding = gap;
  }
  const intervals = [];
  let x = padding;
  for (const size of intervalSizes) {
    intervals.push({ left: x, center: x + size / 2, right: x + size, size });
    x += size + gap;
  }
  if (intervalSizes.length > 0) {
    x -= gap;
  }
  x += padding;
  const totalSize = x;
  if (center) {
    for (const interval of intervals) {
      interval.left -= totalSize / 2;
      interval.center -= totalSize / 2;
      interval.right -= totalSize / 2;
    }
  }
  return { intervals, totalSize };
}
