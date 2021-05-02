export class Queue<T> {
  private arr: T[] = []

  constructor(public readonly maxSize: number) { }

  put(item: T): T | null {
    return this.arr.push(item) > this.maxSize ? this.arr.shift() || null : null;;
    // return this.arr.length
  }

  readAll(): T[] {
    return this.arr;
  }
}