import { Balances, Result } from '@social-contract/libs/core/system';
import { Queue, sum } from '@social-contract/libs/utils/helpers';

export class SuccessRateRecorder {
  private preBalances?: Balances;
  reportedResults: Queue<Result>;
  trueResults: Queue<Result>;

  constructor(public readonly maxSize: number) {
    this.reportedResults = new Queue<Result>(this.maxSize);
    this.trueResults = new Queue<Result>(this.maxSize);
  }

  isSameWithPreBalances(balances: Balances): boolean {
    const res = JSON.stringify(this.preBalances) === JSON.stringify(balances);
    this.preBalances = balances;
    return res;
  }

  addReportedResult(result: Result): void {
    this.reportedResults.put(result);
  }

  addTrueResult(result: Result): void {
    this.trueResults.put(result);
  }

  calcTrueSuccessRate(): number | null {
    const queue = this.trueResults;
    return this.calcSuccessRate(queue)
  }

  calcReportedSuccessRate(): number | null {
    const queue = this.reportedResults;
    return this.calcSuccessRate(queue)
  }

  private calcSuccessRate(queue: Queue<Result>): number | null {
    const results = queue.readAll();
    if (results.length !== queue.maxSize) return null;
    return sum(results.map(r => r === Result.SUCCESS ? 1 : 0)) / results.length;
  }
}