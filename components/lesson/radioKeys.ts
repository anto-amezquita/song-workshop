/**
 * Arrow keys in a radio group: Right and Down move to the next option, Left
 * and Up to the previous, wrapping at the ends. Returns the index to move to,
 * or null for any other key.
 */
export function nextRadioIndex(key: string, index: number, count: number): number | null {
  const step =
    key === "ArrowRight" || key === "ArrowDown"
      ? 1
      : key === "ArrowLeft" || key === "ArrowUp"
        ? -1
        : 0;
  return step ? (index + step + count) % count : null;
}
