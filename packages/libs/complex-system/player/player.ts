import { IReputationSystem, Transaction, Result } from '@social-contract/libs/core/system';
import { Action, Actor } from '@social-contract/libs/core/actor';
import { PlayerId } from '@social-contract/libs/core/player'
import { IContractPlayer, MessageType, ContractMessage } from './player.interface';
import { getLogger } from 'log4js';
const logger = getLogger('@social-contract/implements/scp/player');

export abstract class BaseContractPlayer extends Actor<MessageType> implements IContractPlayer {
  t: number = 0;
  abstract name: string;
  addressBook = new Map<PlayerId, BaseContractPlayer>();

  constructor (public id: PlayerId, public system: IReputationSystem) {
    super(id);
    this.initializeVariables();
  }

  // 商取引ゲームでsellerの場合に商品を送る
  sendGoods(buyer: IContractPlayer): void { }

  // 約束を履行していたか確認
  reportResult(seller: IContractPlayer, escrows: IContractPlayer[]): Result {
    // 商取引の結果を決定する
    const result = this.decideResult(seller.id);

    // Transactionを作成
    const transaction = this.buildTransaction(this.t, seller.id, this.id, result);

    // Transactionを全員に送信
    this.multicastRecord(escrows.map(e => e.id).filter(id => id!==this.id), transaction);

    // テストのために商取引の結果を返す
    return result;
  }

  // 時刻tの記録を署名して送信する。
  protected multicastRecord(escrowIds: PlayerId[] , transaction: Transaction, signs: PlayerId[] = [this.id]) {
    const message = this.buildMessage(transaction, signs);
    this.multicastMessage(escrowIds, message);
  }

  // 商品は存在しないので何もしない
  @Action(MessageType.GOODS)
  receiveGoods(_: any, senderId: PlayerId) { }

  traitors = new Set<PlayerId>();
  signers: Map<Result, Set<PlayerId>> = new Map();
  reporters: Map<Result, Set<PlayerId>> = new Map();
  V = new Set<Result>();

  protected initializeVariables() {
    this.signers = new Map().set(Result.SUCCESS, new Set()).set(Result.FAILED, new Set());
    this.reporters = new Map().set(Result.SUCCESS, new Set()).set(Result.FAILED, new Set());
    this.V = new Set<Result>();
  }

  // 報告された記録を評判システムに入力
  @Action(MessageType.RESULT)
  receiveResult({transaction, signs}: {transaction: Transaction, signs: PlayerId[]}, senderId: PlayerId): void {
    const v = transaction.result;
    const [_, buyerId] = this.system.getCombination(this.t);

    if (signs.length === 1 && signs[signs.length-1] === buyerId && this.V.size === 0) {
      this.V = new Set([v]);
      const escrowIds = this.system.getPlayerIds().filter(id => signs.includes(id));
      this.multicastRecord(escrowIds, transaction, [...signs, this.id]);
    } else if (signs[0] === buyerId && signs[signs.length] !== buyerId && !this.V.has(v as Result)) {
      this.V.add(v);
      const escrowIds = this.system.getPlayerIds().filter(id => signs.includes(id));
      this.multicastRecord(escrowIds, transaction, [...signs, this.id]);
    }

    // 署名付きの値を受け取ったが、それを本人から受け取っていない成員を記録する
    signs.forEach(sign => this.signers.get(v as Result)!.add(sign));
    this.reporters.get(v as Result)!.add(senderId);
  }

  commitRecord(): void {
    const [sellerId, buyerId] = this.system.getCombination(this.t);

    if (this.V.size === 0) this.traitors.add(buyerId);
    const result = this.V.size === 1 ? [...this.V.values()][0] : Result.FAILED;
    
    this.system.setTransaction({t: this.t, sellerId, buyerId, result});

    for (const [key, values] of this.signers.entries()) {
      for (const id of [...values].filter(id => !this.reporters.get(key)!.has(id))) {
        this.traitors.add(id)
      }
    }

    this.initializeVariables();
  }

  decide(sellerId: PlayerId): boolean {
    return !this.traitors.delete(sellerId);
  }

  decideResult(sellerId: PlayerId): Result {
    return this.decide(sellerId) ? Result.SUCCESS : Result.FAILED;
  }
  
  protected buildTransaction(t: number, sellerId: PlayerId, buyerId: PlayerId, result: Result): Transaction {
    return { t, sellerId, buyerId, result};
  }

  protected multicastMessage<K>(playerIds: PlayerId[], message: ContractMessage<K>) {
    for (const playerId of playerIds) {
      const player = this.addressBook.get(playerId)!;
      this.sendMessage(player, message);
    }
  }

  protected buildMessage(transaction: Transaction, signs: PlayerId[]) {
    return { type: MessageType.RESULT, data: {transaction, signs} };
  }
}
