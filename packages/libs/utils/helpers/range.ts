const _range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => i);
export const range = (start: number, end: number) => {
  return _range(start - start, end - start).map(i => i + start);
}
