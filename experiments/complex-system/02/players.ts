import { Action, PlayerId, History, Result, Transaction, PlayerStrategy } from '@social-contract/libs/core';
import { MessageType, IContractPlayer, BaseContractPlayer } from '@social-contract/libs/complex-system';

export const PLAYER_TYPES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
export type PlayerType = typeof PLAYER_TYPES[number];
export enum Support { JST, UTC }

interface MessageData {
  support: Support;
  transactions: Transaction[];
}

export abstract class BasePlayer extends BaseContractPlayer {
  abstract readonly type: PlayerType;
  abstract readonly support: Support;
  abstract readonly strategy: PlayerStrategy;

  private readonly supportMap = new Map<PlayerId, Support>();

  get name(): string {
    return `Player ${this.id}(${this.type}, ${this.support})`;
  }

  sendGoodsMessage(receiver: IContractPlayer, transactions: Transaction[]) {
    const data: MessageData = {transactions: transactions, support: this.support};
    const message = { type: MessageType.GOODS, data };
    this.sendMessage(receiver, message);
    return message;
  }

  @Action(MessageType.GOODS)
  receiveGoods(data: any, senderId: PlayerId): Record<number, History> {
    const {transactions, support} = data as MessageData;
    this.setPlayerSupport(senderId, support);
    return this.setReportedTransactions(transactions.map(r => ({...r, reporterId: senderId})));
  }

  setPlayerSupport(reporterId: PlayerId, support: Support) {
    this.supportMap.set(reporterId, support);
  }

  isSameSupporter(playerId: PlayerId): boolean {
    return this.supportMap.get(playerId) === this.support;
  }
}

/**
 * 誠実なプレイヤー
 * Sellerのとき、UTCの時刻を送る。
 * Buyerのとき、SellerがUTCの時刻を送ったら成功を報告し、JSTの時刻を送ったら失敗を報告する。
 */
export class PlayerTypeA extends BasePlayer {
  readonly type: PlayerType = 'A';
  readonly support = Support.UTC;
  readonly strategy: PlayerStrategy = [1, 1];

  determineResult(sellerId: PlayerId, start: number, end: number): Result {
    const result = super.determineResult(sellerId, start, end);
    return result === Result.SUCCESS && this.isSameSupporter(sellerId) ? Result.SUCCESS : Result.FAILED;
  }
}

/**
 * Sellerのとき、UTCの時刻を送る。
 * Buyerのとき、SellerがUTCの時刻を送ったら成功を報告し、JSTの時刻を送っても成功を報告する。
 */
export class PlayerTypeB extends BasePlayer {
  readonly type: PlayerType = 'B';
  readonly support = Support.UTC;
  readonly strategy: PlayerStrategy = [1, 2];

  determineResult(sellerId: PlayerId, start: number, end: number): Result {
    const result = super.determineResult(sellerId, start, end);
    return result === Result.SUCCESS && this.isSameSupporter(sellerId) ? Result.SUCCESS : Result.SUCCESS;
  }
}

/**
 * Sellerのとき、UTCの時刻を送る。
 * Buyerのとき、SellerがUTCの時刻を送ったら失敗を報告し、JSTの時刻を送ったら成功を報告する。
 */
export class PlayerTypeC extends BasePlayer {
  readonly type: PlayerType = 'C';
  readonly support = Support.UTC;
  readonly strategy: PlayerStrategy = [1, 3];

  determineResult(sellerId: PlayerId, start: number, end: number): Result {
    const result = super.determineResult(sellerId, start, end);
    return result === Result.SUCCESS && this.isSameSupporter(sellerId) ? Result.FAILED : Result.SUCCESS;
  }
}

/**
 * Sellerのとき、UTCの時刻を送る。
 * Buyerのとき、SellerがUTCの時刻を送ったら失敗を報告し、JSTの時刻を送ったら失敗を報告する。
 */
export class PlayerTypeD extends BasePlayer {
  readonly type: PlayerType = 'D';
  readonly support = Support.UTC;
  readonly strategy: PlayerStrategy = [1, 4];

  determineResult(sellerId: PlayerId, start: number, end: number): Result {
    const result = super.determineResult(sellerId, start, end);
    return result === Result.SUCCESS && this.isSameSupporter(sellerId) ? Result.FAILED : Result.FAILED;
  }
}

/**
 * Sellerのとき、JSTの時刻を送る。
 * Buyerのとき、SellerがJSTの時刻を送ったら成功を報告し、UTCの時刻を送ったら失敗を報告する。
 */
export class PlayerTypeE extends BasePlayer {
  readonly type: PlayerType = 'E';
  readonly support = Support.JST;
  readonly strategy: PlayerStrategy = [2, 1];

  determineResult(sellerId: PlayerId, start: number, end: number): Result {
    const result = super.determineResult(sellerId, start, end);
    return result === Result.SUCCESS && this.isSameSupporter(sellerId) ? Result.SUCCESS : Result.FAILED;
  }
}

/**
 * Sellerのとき、JSTの時刻を送る。
 * Buyerのとき、SellerがJSTの時刻を送ったら成功を報告し、UTCの時刻を送ったら成功を報告する。
 */
export class PlayerTypeF extends BasePlayer {
  readonly type: PlayerType = 'F';
  readonly support = Support.JST;
  readonly strategy: PlayerStrategy = [2, 2];

  determineResult(sellerId: PlayerId, start: number, end: number): Result {
    const result = super.determineResult(sellerId, start, end);
    return result === Result.SUCCESS && this.isSameSupporter(sellerId) ? Result.SUCCESS : Result.SUCCESS;
  }
}

/**
 * Sellerのとき、JSTの時刻を送る。
 * Buyerのとき、SellerがJSTの時刻を送ったら失敗を報告し、UTCの時刻を送ったら成功を報告する。
 */
export class PlayerTypeG extends BasePlayer {
  readonly type: PlayerType = 'G';
  readonly support = Support.JST;
  readonly strategy: PlayerStrategy = [2, 3];

  determineResult(sellerId: PlayerId, start: number, end: number): Result {
    const result = super.determineResult(sellerId, start, end);
    return result === Result.SUCCESS && this.isSameSupporter(sellerId) ? Result.FAILED : Result.SUCCESS;
  }
}

/**
 * Sellerのとき、JSTの時刻を送る。
 * Buyerのとき、SellerがJSTの時刻を送ったら失敗を報告し、UTCの時刻を送ったら失敗を報告する。
 */
export class PlayerTypeH extends BasePlayer {
  readonly type: PlayerType = 'H';
  readonly support = Support.JST;
  readonly strategy: PlayerStrategy = [2, 4];

  determineResult(sellerId: PlayerId, start: number, end: number): Result {
    const result = super.determineResult(sellerId, start, end);
    return result === Result.SUCCESS && this.isSameSupporter(sellerId) ? Result.FAILED : Result.FAILED;
  }
}
