import { ICommerceSystem, Transaction, History, Result } from '@social-contract/core/system';
import { Action, Actor } from '@social-contract/core/actor';
import { PlayerId, PlayerStrategy, Reports } from '@social-contract/core/player'
import { range } from '@social-contract/core/helpers';
import { IContractPlayer, MessageType, ContractMessage } from './player.interface';
import { getLogger } from 'log4js';
const logger = getLogger('@social-contract/implements/scp/player');

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
  // 時刻t-n(n-1)から時刻t-1までに報告されたRecordをbuyerに送信
  sendGoods(buyer: IContractPlayer): ContractMessage<Transaction[]> {
    // プレイヤー数を取得する
    const n = this.system.n;
    
    // 報告された商取引の結果を取得する
    const start = this.t - n * (n - 1);
    const end = this.t;
    const transactions = this.getReportedTransactions(start, end);
    
    // 報告された商取引の結果を送信する
    const message = { type: MessageType.GOODS, data: transactions };
    this.sendMessage(buyer, message);

    // テスト用のコード
    return message;
  }

  // 商取引ゲームの結果を報告する
  // たぶん、ここのアルゴリズムが難しい。
  // ①自分が支持するレコードと前回、送信されたレコードが一致しているか
  // ②自分が支持するレコードと違う結果を報告したPlayerであるか
  reportResult(seller: IContractPlayer, escrows: IContractPlayer[]): Result {
    // プレイヤー数を取得する
    const n = this.system.n;

    // 支持する歴史を決定する
    const keys = Object.keys(this.system.history).map(k => parseInt(k, 10));
    const start = keys.length ? Math.max(...keys) + 1 : 1;
    const end = start + n * (n - 1) - 1;
    // const start = this.t - 2 * n * (n - 1);
    // const end = this.t - n * (n - 1) - 1;
    logger.warn(`start: ${start}, end: ${end}`);
    const transactions = end < this.t ? this.determineSupportingTransactions(start, end) : [];

    // 支持する歴史を商取引システムに設定する
    for (const t of transactions) this.system.setTransaction(t);
    
    // 商取引の結果を決定する
    // 時刻startからendまでの支持する歴史とsellerが報告した歴史が一致するか
    const result = end < this.t ? this.determineResult(seller.id, start, end) : Result.SUCCESS;

    // 全体に結果を報告
    const message: ContractMessage<Transaction> = {
      type: MessageType.RESULT,
      data: this.buildRecord(seller.id, result)
    };
    this.broadcastMessage<Transaction>(escrows, message);

    // MEMO: テストのために商取引の結果を返す
    return result;
  }

  // 商取引ゲームで受け取ったTransactionsを記録する
  @Action(MessageType.GOODS)
  receiveGoods(transactions: Transaction[], senderId: PlayerId): Record<number, History> {
    return this.setReportedTransactions(transactions.map(r => ({...r, reporterId: senderId})));
  }

  // 報告された商取引ゲームの結果を記録する
  @Action(MessageType.RESULT)
  receiveResult(transaction: Transaction, senderId: PlayerId): void {
    this.setReportedTransaction({...transaction, reporterId: senderId});
  }

  private buildRecord(sellerId: PlayerId, result: Result): Transaction {
    return { t: this.t, sellerId, buyerId: this.id, result };
  }

  private broadcastMessage<K>(players: IContractPlayer[], message: ContractMessage<K>) {
    for (const player of players) this.sendMessage(player, message);
  }

  // 商取引ゲームの結果を確定する
  private determineResult(sellerId: PlayerId, start: number, end: number): Result {
    // 時刻startからendまでの商取引システムに記録されたトランザクションの結果と
    for (const t of range(start, end-1)) {
      if (t <= 0) continue;
      const transaction = this.system.getTransaction(t);
      if(transaction.result !== this.getReportedTransaction(sellerId, t).result) return Result.FAILED
    }
    return Result.SUCCESS;
  }

  // 支持する歴史を決定する
  private determineSupportingTransactions(start: number, end: number): Transaction[] {
    const transactions: Transaction[] = [];

    // 時刻startからendまでのhistoryを確定する
    for (let t = start; 0 < t && t < end; t++) {
      // logger.debug(`t: ${t}, player(${this.id}).reports:`, this.reports);
      const transaction = this.determineSupportingTransaction(t);
      transactions.push(transaction)
    }
    return transactions;
  }

  // 報告されたトランザクションから支持するトランザクションを決定する
  private determineSupportingTransaction(t: number): Transaction {
    let score = 0;
    // TODO: ここ、undefinedが変える場合がある。
    const transaction = this.getReportedTransaction(this.id, t);

    for (const playerId of this.system.getPlayerIds()) {
      // 時刻t-1のbalanceを取得する
      const weight = this.system.getBalance(playerId, t - 1);
      
      // playerが報告した時刻tのトランザクションを取得する
      const transaction = this.getReportedTransaction(playerId, t);
      
      // 報告されたトランザクションが存在しない場合、飛ばす。
      if (!transaction) continue;
      
      // 
      score += (transaction.result === Result.SUCCESS ? 1 : -1) * weight;
    }

    // scoreから時刻tの支持するトランザクションの結果を決定する
    const result = score > 0 ? Result.SUCCESS : Result.FAILED

    return { ...transaction, t, result };
  }

  private setReportedTransactions(transactions: Transaction[]) {
    for (let transaction of transactions) this.setReportedTransaction(transaction);
    return this.reports;
  }

  private setReportedTransaction(transaction: Transaction) {
    this.reports[transaction.reporterId!] = this.reports[transaction.reporterId!] || {};
    this.reports[transaction.reporterId!][transaction.t] = transaction;
  }

  // 時刻startから時刻endまでに報告されたトランザクションを取得する
  private getReportedTransactions(start: number, end: number): Transaction[] {
    const timeRange = range(start, end);
    return Object.values(this.reports).map(history => Object.values(history)).flat()
      .filter(transaction => timeRange.includes(transaction.t));
  }

  getReportedTransaction(reporterId: PlayerId, t: number): Transaction {
    return this.reports?.[reporterId]?.[t];
  }

}