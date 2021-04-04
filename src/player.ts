import { PlayerStrategy, PlayerId, History, CommerceRecord, CommerceResult } from './models';
import { CommerceSystem } from './system';
import { Action, Actor, Message as _Message } from './actor';

export enum MessageType {
  GOODS = 'GOODS',
  RESULT = 'RESULT',
}

export type Message<K> = _Message<MessageType, K>;
export type Reports = Record<PlayerId, History>;

export class Player extends Actor<MessageType> {
  t: number = 0;
  private reports: Reports = {};

  constructor (
    public id: PlayerId,
    private system: CommerceSystem,
    private strategy: PlayerStrategy = [1, 2],
  ) {
    super(id);
  }

  // 商取引ゲームでsellerの場合に商品を送るメソッド
  sendGoods(buyer: Player): Message<CommerceRecord[]> {
    return this.sendReportedRecords(buyer);
  }

  reportResult(seller: Player, escrows: Player[]): Message<CommerceRecord> {
    return this._reportResult(seller, escrows);
  }

  @Action(MessageType.GOODS)
  receiveGoods(records: CommerceRecord[], senderId: PlayerId): Record<number, History> {
    return this.addRecords(records.map(r => ({...r, reporterId: senderId})));
  }

  @Action(MessageType.RESULT)
  receiveResult(record: CommerceRecord, senderId: PlayerId) {
    return this.addRecord({...record, reporterId: senderId});
  }

  // 時刻t-n(n-1)から時刻t-1までに報告されたRecordをbuyerに送信
  private sendReportedRecords(buyer: Player): Message<CommerceRecord[]> {
    const n = this.system.n;
    const records = this.getReportedRecords(n * (n - 1));
    const message: Message<CommerceRecord[]> = {
      type: MessageType.GOODS,
      data: records
    }
    this.sendMessage(buyer, message);

    // MEMO: テスト用のコード
    return message;
  }

  // たぶん、ここのアルゴリズムが難しい。
  // ①自分が支持するレコードと前回、送信されたレコードが一致しているか
  // ②自分が支持するレコードと違う結果を報告したPlayerであるか
  private _reportResult(seller: Player, escrows: Player[]): Message<CommerceRecord> {
    const n = this.system.n;

    // 支持する歴史を決定
    this.determineSupportedHistory();
    
    // TODO: 商取引の結果を決定
    const result = this.determineResult(seller.id, this.t - n * (n - 1));

    // 全体に結果を報告
    const message: Message<CommerceRecord> = {
      type: MessageType.RESULT,
      data: this.buildRecord(seller.id, result)
    };
    this.broadcastMessage<CommerceRecord>(escrows, message);

    // MEMO: テストのために商取引の結果を返す
    return message;
  }

  private getReportedRecords(size: number): CommerceRecord[] {
    return [...Array(size)].map((_, i) => this.reports?.[this.id]?.[i]).filter(r => !!r);
  }

  private buildRecord(sellerId: PlayerId, result: CommerceResult): CommerceRecord {
    return { 
      t: this.t, 
      sellerId, 
      buyerId: this.id, 
      result 
    };
  }

  private broadcastMessage<K>(players: Player[], message: Message<K>) {
    for (const player of players) this.sendMessage(player, message);
  }

  private determineSupportedHistory() {
    const n = this.system.n;
    // 時刻t-2n(n-1)からt-n(n-1)までのhistoryを確定する
    for (let p=0;p<n*(n-1);p++) {
      const time = this.t - 2 * n * (n -1) + p;
      const record = this.determineSupportedRecord(time);
      this.system.setRecord(record);
    }
  }

  private determineResult(sellerId: PlayerId, t: number): CommerceResult {
    return CommerceResult.SUCCESS
  }

  private determineSupportedRecord(t: number): CommerceRecord {
    let flagScore = 0;

    for (let i = 0; i < this.system.n; i++) {
      // TODO: ここのscoreってどの時刻のscore?
      const score = this.system.getBalance(i);
      const record = this.reports[i][t];
      flagScore += (record.result === CommerceResult.SUCCESS ? 1 : -1) * score;
    }
 
    return {
      t: t,
      sellerId: 0,
      buyerId: 0,
      result: flagScore > 0 ? CommerceResult.SUCCESS : CommerceResult.FAILED
    }
  }

  private addRecords(records: CommerceRecord[]) {
    for (let record of records) this.addRecord(record);
    return this.reports;
  }

  private addRecord(record: CommerceRecord) {
    this.reports[record.reporterId!] = this.reports[record.reporterId!] || {};
    this.reports[record.reporterId!][record.t] = record;
  }

}