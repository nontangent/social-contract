import { ICommerceSystem, Transaction, History, Result } from '@social-contract/core/system';
import { Action, Actor } from '@social-contract/core/actor';
import { PlayerId, PlayerStrategy, Reports } from '@social-contract/core/player'
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
  // 時刻t-n(n-1)から時刻t-1までに報告されたRecordをbuyerに送信
  sendGoods(buyer: IContractPlayer): ContractMessage<Transaction[]> {
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

  // 商取引ゲームの結果を報告する
  // たぶん、ここのアルゴリズムが難しい。
  // ①自分が支持するレコードと前回、送信されたレコードが一致しているか
  // ②自分が支持するレコードと違う結果を報告したPlayerであるか
  reportResult(seller: IContractPlayer, escrows: IContractPlayer[]): ContractMessage<Transaction> {
    const n = this.system.n;

    // 支持する歴史を決定する
    const transactions = this.determineSupportedHistory();

    console.debug('transactions:', transactions);

    // 支持する歴史を商取引システムに設定する
    for (const t of transactions) this.system.setTransaction(t);
    
    // TODO: 商取引の結果を決定する
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

  // 商取引ゲームで受け取ったTransactionsを記録する
  @Action(MessageType.GOODS)
  receiveGoods(transactions: Transaction[], senderId: PlayerId): Record<number, History> {
    return this.addReportedTransactions(transactions.map(r => ({...r, reporterId: senderId})));
  }

  // 報告された商取引ゲームの結果を記録する
  @Action(MessageType.RESULT)
  receiveResult(transaction: Transaction, senderId: PlayerId): void {
    this.addReportedTransaction({...transaction, reporterId: senderId});
  }

  private buildRecord(sellerId: PlayerId, result: Result): Transaction {
    return { t: this.t, sellerId, buyerId: this.id, result };
  }

  private broadcastMessage<K>(players: IContractPlayer[], message: ContractMessage<K>) {
    for (const player of players) this.sendMessage(player, message);
  }

  // TODO: 
  private determineResult(sellerId: PlayerId, t: number): Result {
    return Result.FAILED
  }

  // 支持する歴史を決定する
  private determineSupportedHistory(): Transaction[] {
    const n = this.system.n;
    const transactions: Transaction[] = [];

    // 時刻t-2n(n-1)からt-n(n-1)までのhistoryを確定する
    for (let t = this.t - 2 * n * (n - 1); 0 < t && t<this.t; t++) {
      console.debug('t:', t);
      console.debug('this.reports:', this.reports);
      const transaction = this.determineSupportedTransaction(t);
      transactions.push(transaction)
    }
    return transactions;
  }

  // 報告されたトランザクションから支持するトランザクションを決定する
  private determineSupportedTransaction(t: number): Transaction {
    let score = 0;
    const transaction = this.getReportedTransaction(this.id, this.t);

    for (const playerId of this.system.getPlayerIds()) {
      // TODO: ここのscoreってどの時刻のscore?
      const weight = this.system.getBalance(playerId, this.t);
      const { result } = this.getReportedTransaction(playerId, this.t);
      score += (result === Result.SUCCESS ? 1 : -1) * weight;
    }

    const result = score > 0 ? Result.SUCCESS : Result.FAILED

    return { ...transaction, result};
  }

  private addReportedTransactions(transactions: Transaction[]) {
    for (let transaction of transactions) this.addReportedTransaction(transaction);
    return this.reports;
  }

  private addReportedTransaction(transaction: Transaction) {
    this.reports[transaction.reporterId!] = this.reports[transaction.reporterId!] || {};
    this.reports[transaction.reporterId!][transaction.t] = transaction;
  }

  private getReportedTransactions(size: number): Transaction[] {
    return [...Array(size)].map((_, i) => this.reports?.[this.id]?.[i]).filter(r => !!r);
  }

  getReportedTransaction(reporterId: PlayerId, t: number): Transaction {
    return this.reports?.[reporterId]?.[t];
  }

}