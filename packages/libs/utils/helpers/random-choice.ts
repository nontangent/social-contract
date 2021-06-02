export function randomChoice<T = any>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}