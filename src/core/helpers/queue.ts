export class Queue<T> {
  private arr: T[] = []

  constructor(public readonly maxSize: number) { }

  put(item: T) {
    this.arr.push(item);
    if (this.arr.length > this.maxSize) {
      this.arr.shift();
    }
  }

  readAll(): T[] {
    return this.arr;
  }
}