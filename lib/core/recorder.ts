import { Balances, Result } from '@social-contract/core/system';
import { Queue } from '@social-contract/utils/helpers';

export class SuccessRateRecorder {
  private preBalances?: Balances;
  reportedResults = new Queue<Result>(100);
  trueResults = new Queue<Result>(100);

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