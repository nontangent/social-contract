import { ICommerceSystem, Transaction, History, Result } from '@social-contract/core/system';
import { Action, Actor } from '@social-contract/core/actor';
import { IPlayer, PlayerId, PlayerStrategy, Reports } from '@social-contract/core/player'
import { IContractPlayer, MessageType, ContractMessage } from './player.interface';

export class Player extends Actor<MessageType> implements IContractPlayer {
  t: number = 0;
  private reports: Reports = {};

  constructor (
    public id: PlayerId,
    public system: ICommerceSystem,
    private strategy: PlayerStrategy = [1, 2],
  ) {
    super(id);
  }

  // 商取引ゲームでsellerの場合に商品を送る
  sendGoods(buyer: IContractPlayer): ContractMessage<Transaction[]> {
    return this.sendReportedRecords(buyer);
  }

  // 商取引ゲームの結果を報告する
  reportResult(seller: IContractPlayer, escrows: IContractPlayer[]): ContractMessage<Transaction> {
    return this._reportResult(seller, escrows);
  }

  @Action(MessageType.GOODS)
  receiveGoods(records: Transaction[], senderId: PlayerId): Record<number, History> {
    return this.addTransactions(records.map(r => ({...r, reporterId: senderId})));
  }

  @Action(MessageType.RESULT)
  receiveResult(record: Transaction, senderId: PlayerId): void {
    this.addTransaction({...record, reporterId: senderId});
  }

  // 時刻t-n(n-1)から時刻t-1までに報告されたRecordをbuyerに送信
  private sendReportedRecords(buyer: IContractPlayer): ContractMessage<Transaction[]> {
    const n = this.system.n;
    const transactions = this.getReportedTransactions(n * (n - 1));
    const message: ContractMessage<Transaction[]> = {
      type: MessageType.GOODS,
      data: transactions
    }
    this.sendMessage(buyer, message);

    // MEMO: テスト用のコード
    return message;
  }

  // たぶん、ここのアルゴリズムが難しい。
  // ①自分が支持するレコードと前回、送信されたレコードが一致しているか
  // ②自分が支持するレコードと違う結果を報告したPlayerであるか
  private _reportResult(seller: IContractPlayer, escrows: IContractPlayer[]): ContractMessage<Transaction> {
    const n = this.system.n;

    // 支持する歴史を決定
    this.determineSupportedHistory();
    
    // TODO: 商取引の結果を決定
    const result = this.determineResult(seller.id, this.t - n * (n - 1));

    // 全体に結果を報告
    const message: ContractMessage<Transaction> = {
      type: MessageType.RESULT,
      data: this.buildRecord(seller.id, result)
    };
    this.broadcastMessage<Transaction>(escrows, message);

    // MEMO: テストのために商取引の結果を返す
    return message;
  }

  private getReportedTransactions(size: number): Transaction[] {
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

  private broadcastMessage<K>(players: IContractPlayer[], message: ContractMessage<K>) {
    for (const player of players) this.sendMessage(player, message);
  }

  private determineSupportedHistory() {
    const n = this.system.n;
    // 時刻t-2n(n-1)からt-n(n-1)までのhistoryを確定する
    for (let p=0;p<n*(n-1);p++) {
      const time = this.t - 2 * n * (n -1) + p;
      const transaction = this.determineSupportedRecord(time);
      this.system.setTransaction(transaction);
    }
  }

  private determineResult(sellerId: PlayerId, t: number): Result {
    return Result.SUCCESS
  }

  private determineSupportedRecord(t: number): Transaction {
    let flagScore = 0;

    for (const playerId of this.system.getPlayerIds()) {
      // TODO: ここのscoreってどの時刻のscore?
      const score = this.system.getBalance(playerId, this.t);
      const transaction = this.reports[playerId][t];
      flagScore += (transaction.result === Result.SUCCESS ? 1 : -1) * score;
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