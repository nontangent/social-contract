import { ICommerceSystem, Transaction, History, Result } from '@social-contract/libs/core/system';
import { Action, Actor } from '@social-contract/libs/core/actor';
import { PlayerId, Reports } from '@social-contract/libs/core/player'
import { range, b10, z4, clone } from '@social-contract/libs/utils/helpers';
import { IContractPlayer, MessageType, ContractMessage } from './player.interface';
import { getLogger } from 'log4js';
const logger = getLogger('@social-contract/implements/scp/player');

export abstract class BaseContractPlayer extends Actor<MessageType> implements IContractPlayer {
  t: number = 0;
  private reports: Reports = {};

  constructor (
    public id: PlayerId,
    public system: ICommerceSystem,
  ) {
    super(id);
  }

  abstract name: string;

  // 商取引ゲームでsellerの場合に商品を送る
  // 時刻t-n(n-1)から時刻t-1までに報告されたRecordをbuyerに送信
  sendGoods(buyer: IContractPlayer): ContractMessage<Transaction[]> {
    // プレイヤー数を取得する
    const n = this.system.n;
    
    // 報告された商取引の結果を取得する
    const start = this.t - n * (n - 1);
    const end = this.t - 1;
    const transactions = this.getReportedTransactions(start, end);
    
    // 報告された商取引の結果を送信する
    return this.sendGoodsMessage(buyer, transactions);
  }

  sendGoodsMessage(receiver: IContractPlayer, transactions: Transaction[]): ContractMessage<any> {
    // 報告された商取引の結果を送信する
    const message = { type: MessageType.GOODS, data: transactions };
    this.sendMessage(receiver, message);
    return message;
  }

  // 商取引ゲームの結果を報告する
  // たぶん、ここのアルゴリズムが難しい。
  // ①自分が支持するレコードと前回、送信されたレコードが一致しているか
  // ②自分が支持するレコードと違う結果を報告したPlayerであるか

  // 時刻t-2n(n-1)~時刻t-n(n-1)までのトランザクションは全員から一度づつ報告されているので、
  // 時刻t-2n(n-1)~時刻t-n(n-1)までの支持する歴史は決定できる
  // 時刻t-2n(n-1)~時刻t-n(n-1)までの間にbuyerが報告したTransactionが支持する歴史の結果と一つでも一致しないならば失敗を報告する
  reportResult(seller: IContractPlayer, escrows: IContractPlayer[]): Result {
    // プレイヤー数を取得する
    const n = this.system.n;

    // 支持する歴史を決定する
    const start = this.t - 2 * n * (n - 1) + 1;
    const end = this.t - n * (n - 1) + 1;
    this.determineSupportingTransactions(start, end);
    
    // 商取引の結果を決定する
    const result = this.determineResult(seller.id, start, end);

    // 全体に結果を報告
    this.broadcastResult(seller.id, escrows, result);

    // テストのために商取引の結果を返す
    return result;
  }

  // 商取引ゲームで受け取ったTransactionsを記録する
  @Action(MessageType.GOODS)
  receiveGoods(data: any, senderId: PlayerId): Record<number, History> {
    const transactions: Transaction[] = data;
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
  determineResult(sellerId: PlayerId, start: number, end: number): Result {
    // 時刻startからendまでの商取引システムに記録されたトランザクションの結果と比較する
    for (const t of range(start, end-1).filter(t => t > 0)) {
      const transaction = this.system.getTransaction(t);
      if (!transaction) throw new Error('transaction is null');
      if (transaction.result !== this.getReportedTransaction(sellerId, t)!.result) return Result.FAILED;
    }
    return Result.SUCCESS;
  }

  // 支持する歴史を決定する
  private determineSupportingTransactions(start: number, end: number): void{
    // 時刻startからendまでのhistoryを確定する
    for (let t = start; t < end; t++) {
      if (t <= 0 || this.system.getTransaction(t)) continue;
      this.determineSupportingTransaction(t);
    }
  }

  // 報告されたトランザクションから支持するトランザクションを決定する
  private determineSupportingTransaction(t: number): void {
    // 自分がreporterの場合はそのトランザクションを正しい歴史とする
    const transaction = this.getReportedTransaction(this.id, t);
    if (transaction) return this.system.setTransaction(transaction);

    // 時刻tの商取引ゲームのsellerとbuyerを取得する
    const [sellerId, buyerId] = this.system.getCombination(t);

    // 重みとなるbalanceを取得する
    const n = this.system.n;
    const balances = this.system.getBalances(Math.max(0, t - 2 * n * (n - 1) + 1));

    // 各プレイヤーが報告した結果からスコアを計算する
    const score = this.system.getPlayerIds([this.id]).reduce((score, id) => {
      const transaction = this.getReportedTransaction(id, t);
      if (!transaction) throw new Error('transaction is null!');
      return score + (transaction.result === Result.SUCCESS ? 1 : -1) * balances[id];
    }, 0);

    // scoreから時刻tの支持するトランザクションの結果を決定する
    const result = score > 0 ? Result.SUCCESS : Result.FAILED;
    return this.system.setTransaction({ sellerId, buyerId, t, result });
  }

  // 報告されたトランザクションを記録する
  protected setReportedTransactions(transactions: Transaction[]) {
    for (let transaction of transactions) this.setReportedTransaction(transaction);
    return this.reports;
  }

  // 報告されたトランザクションを記録する
  private setReportedTransaction(transaction: Transaction) {
    this.reports[transaction.reporterId!] = this.reports[transaction.reporterId!] || {};
    this.reports[transaction.reporterId!][transaction.t] = clone(transaction);
  }

  // 時刻startから時刻endまでに報告されたトランザクションを取得する
  private getReportedTransactions(start: number, end: number): Transaction[] {
    const timeRange = range(start, end);
    return Object.values(this.reports).map(history => Object.values(history)).flat()
      .filter(transaction => timeRange.includes(transaction.t))
      .filter(transaction => transaction.reporterId === transaction.buyerId);
  }

  // 報告されたトランザクションを取得する
  private getReportedTransaction(reporterId: PlayerId, t: number): Transaction | null {
    return this.reports?.[reporterId]?.[t] || null;
  }

  private broadcastResult(sellerId: PlayerId, escrows: IContractPlayer[], result: Result): void {
    this.broadcastMessage<Transaction>(escrows, {
      type: MessageType.RESULT,
      data: this.buildRecord(sellerId, result)
    });
  }

}