import { PlayerStrategy, PlayerId, History, CommerceRecord, CommerceResult } from './models';
import { CommerceSystem } from './commerce-system';

export class Player {
  t: number = 0;
  private system: CommerceSystem = new CommerceSystem();
  private strategy: PlayerStrategy = [1, 2];
  private reportedRecords: Record<PlayerId, History> = {};

  constructor (
    public id: PlayerId
  ) { }

  // 時刻t-n(n-1)から時刻t-1までに報告されたRecordをbuyerに送信
  sendReportedRecords(buyer: Player, n: number) {
    const records = [...Array(n * (n - 1))].map((_, i) => {
      // TODO: 修正
      return this.reportedRecords[this.id][i];
    }).filter(record => !!record);
    buyer._receiveReportedRecords(records);
  }

  reportResult(sellerId: number, escrows: Player[], n: number) {
    // 時刻t-2n(n-1)からt-n(n-1)までのhistoryを確定する
    for (let p=0;p<n*(n-1);p++) {
      const time = this.t - 2 * n * (n -1) + p;
      const record = this.determineSupportedRecord(time);
      this.system.setRecord(record);
    }
    
    // 時刻t-n(n-1)にsellerから受け取った結果がただしかったかを決定
    const result = this.determineResult(sellerId, this.t - n * (n - 1));

    for (let p=0;p<n*(n-1);p++) {

    }
    this.reportedRecords[sellerId]
    const record: CommerceRecord = {
      
    } as CommerceRecord;


    for (const escrow of escrows) {
      // escrow.addRecord(record);
    }
  }

  private determineResult(sellerId: PlayerId, t: number): CommerceResult {
    return CommerceResult.SUCCESS
  }

  private determineSupportedRecord(t: number): CommerceRecord {
    let flagScore = 0;

    for (let i = 0; i < this.system.n; i++) {
      // TODO: ここのscoreってどの時刻のscore?
      const score = this.system.getReputationScore(i);
      const record = this.reportedRecords[i][t];
      flagScore += (record.result === CommerceResult.SUCCESS ? 1 : -1) * score;
    }

    return {
      t: t,
      sellerId: 0,
      buyerId: 0,
      result: flagScore > 0 ? CommerceResult.SUCCESS : CommerceResult.FAILED
    }
  }

  _receiveReportedRecords(records: CommerceRecord[]) {

  }

  addRecords(record: CommerceRecord) {

  }

}