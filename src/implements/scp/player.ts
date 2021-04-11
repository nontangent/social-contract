import { CommerceSystem, Transaction, History, Result } from '../system';
import { Action, Actor, Message as _Message } from '../actor';
import { IPlayer, PlayerId, PlayerStrategy, Message, MessageType, Reports } from './player.interface';

export class Player extends Actor<MessageType> implements IPlayer<MessageType> {
  t: number = 0;
  private reports: Reports = {};

  constructor (
    public id: PlayerId,
    public system: CommerceSystem,
    private strategy: PlayerStrategy = [1, 2],
  ) {
    super(id);
  }

  // 商取引ゲームでsellerの場合に商品を送るメソッド
  sendGoods(buyer: IPlayer<MessageType>): Message<Transaction[]> {
    return this.sendReportedRecords(buyer);
  }

  reportResult(seller: IPlayer<MessageType>, escrows: IPlayer<MessageType>[]): Message<Transaction> {
    return this._reportResult(seller, escrows);
  }

  @Action(MessageType.GOODS)
  receiveGoods(records: Transaction[], senderId: PlayerId): Record<number, History> {
    return this.addTransactions(records.map(r => ({...r, reporterId: senderId})));
  }

  @Action(MessageType.RESULT)
  receiveResult(record: Transaction, senderId: PlayerId) {
    return this.addTransaction({...record, reporterId: senderId});
  }

  // 時刻t-n(n-1)から時刻t-1までに報告されたRecordをbuyerに送信
  private sendReportedRecords(buyer: IPlayer<MessageType>): Message<Transaction[]> {
    const n = this.system.n;
    const records = this.getReportedRecords(n * (n - 1));
    const message: Message<Transaction[]> = {
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
  private _reportResult(seller: IPlayer<MessageType>, escrows: IPlayer<MessageType>[]): Message<Transaction> {
    const n = this.system.n;

    // 支持する歴史を決定
    this.determineSupportedHistory();
    
    // TODO: 商取引の結果を決定
    const result = this.determineResult(seller.id, this.t - n * (n - 1));

    // 全体に結果を報告
    const message: Message<Transaction> = {
      type: MessageType.RESULT,
      data: this.buildRecord(seller.id, result)
    };
    this.broadcastMessage<Transaction>(escrows, message);

    // MEMO: テストのために商取引の結果を返す
    return message;
  }

  private getReportedRecords(size: number): Transaction[] {
    return [...Array(size)].map((_, i) => this.reports?.[this.id]?.[i]).filter(r => !!r);
  }

  private buildRecord(sellerId: PlayerId, result: Result): Transaction {
    return { 
      t: this.t, 
      sellerId, 
      buyerId: this.id, 
      result 
    };
  }

  private broadcastMessage<K>(players: IPlayer<MessageType>[], message: Message<K>) {
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

  private determineResult(sellerId: PlayerId, t: number): Result {
    return Result.SUCCESS
  }

  private determineSupportedRecord(t: number): Transaction {
    let flagScore = 0;

    for (const playerId of this.system.playerIds) {
      // TODO: ここのscoreってどの時刻のscore?
      const score = this.system.getBalance(playerId, this.t);
      const record = this.reports[playerId][t];
      flagScore += (record.result === Result.SUCCESS ? 1 : -1) * score;
    }
 
    return {
      t: t,
      sellerId: 0,
      buyerId: 0,
      result: flagScore > 0 ? Result.SUCCESS : Result.FAILED
    }
  }

  private addTransactions(transactions: Transaction[]) {
    for (let transaction of transactions) this.addTransaction(transaction);
    return this.reports;
  }

  private addTransaction(transaction: Transaction) {
    this.reports[transaction.reporterId!] = this.reports[transaction.reporterId!] || {};
    this.reports[transaction.reporterId!][transaction.t] = transaction;
  }

}