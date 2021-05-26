import { Balances, Result } from '@social-contract/core/system';
import { Queue } from '@social-contract/utils/helpers';

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
}