import { PlayerId, Result, Transaction, PlayerStrategy } from '@social-contract/libs/core';
import { BaseContractPlayer } from '@social-contract/libs/complex-system';

export const PLAYER_TYPES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
export type PlayerType = typeof PLAYER_TYPES[number];
export enum Support { A, B }

interface MessageData {
  support: Support;
  transactions: Transaction[];
}

export abstract class BasePlayer extends BaseContractPlayer {
  abstract readonly type: PlayerType;
  abstract readonly support: Support;
  abstract readonly strategy: PlayerStrategy;

  readonly supportMap = new Map<PlayerId, Support>();

  get name(): string {
    return `Player ${this.id}(${this.type})`;
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
 */
export class PlayerTypeA extends BasePlayer {
  readonly type: PlayerType = 'A';
  readonly support = Support.A;
  readonly strategy: PlayerStrategy = [1, 1];
}

export class PlayerTypeB extends BasePlayer {
  readonly type: PlayerType = 'B';
  readonly support = Support.B;
  readonly strategy: PlayerStrategy = [1, 2];

  decideResult(sellerId: PlayerId): Result {
    return Result.SUCCESS;
  }
}

export class PlayerTypeC extends BasePlayer {
  readonly type: PlayerType = 'C';
  readonly support = Support.B;
  readonly strategy: PlayerStrategy = [1, 3];

  decideResult(sellerId: PlayerId): Result {
    return super.decideResult(sellerId) === Result.SUCCESS ? Result.FAILED : Result.SUCCESS;
  }
}

export class PlayerTypeD extends BasePlayer {
  readonly type: PlayerType = 'D';
  readonly support = Support.B;
  readonly strategy: PlayerStrategy = [1, 4];

  multicastRecord(escrowIds: PlayerId[] , transaction: Transaction, signs: PlayerId[] = [this.id]) {
    const message = this.buildMessage(transaction, signs);
    const receiverIds = escrowIds.filter(id => this.isSameSupporter(id));
    this.multicastMessage(receiverIds, message);
  }

  decideResult(sellerId: PlayerId): Result {
    return Result.FAILED;
  }
}

export class PlayerTypeE extends BasePlayer {
  readonly type: PlayerType = 'E';
  readonly support = Support.B;
  readonly strategy: PlayerStrategy = [2, 1];

  multicastRecord(escrowIds: PlayerId[] , transaction: Transaction, signs: PlayerId[] = [this.id]) {
    const message = this.buildMessage(transaction, signs);
    const receiverIds = escrowIds.filter(id => this.isSameSupporter(id));
    this.multicastMessage(receiverIds, message);
  }

}

export class PlayerTypeF extends BasePlayer {
  readonly type: PlayerType = 'F';
  readonly support = Support.B;
  readonly strategy: PlayerStrategy = [2, 2];

  multicastRecord(escrowIds: PlayerId[] , transaction: Transaction, signs: PlayerId[] = [this.id]) {
    const message = this.buildMessage(transaction, signs);
    const receiverIds = escrowIds.filter(id => this.isSameSupporter(id));
    this.multicastMessage(receiverIds, message);
  }

  decideResult(sellerId: PlayerId): Result {
    return Result.SUCCESS;
  }
}

export class PlayerTypeG extends BasePlayer {
  readonly type: PlayerType = 'G';
  readonly support = Support.B;
  readonly strategy: PlayerStrategy = [2, 3];
  
  multicastRecord(escrowIds: PlayerId[] , transaction: Transaction, signs: PlayerId[] = [this.id]) {
    const message = this.buildMessage(transaction, signs);
    const receiverIds = escrowIds.filter(id => this.isSameSupporter(id));
    this.multicastMessage(receiverIds, message);
  }

  decideResult(sellerId: PlayerId): Result {
    return super.decideResult(sellerId) === Result.SUCCESS ? Result.FAILED : Result.SUCCESS;
  }
}

export class PlayerTypeH extends BasePlayer {
  readonly type: PlayerType = 'H';
  readonly support = Support.B;
  readonly strategy: PlayerStrategy = [2, 4];

  multicastRecord(escrowIds: PlayerId[] , transaction: Transaction, signs: PlayerId[] = [this.id]) {
    const message = this.buildMessage(transaction, signs);
    const receiverIds = escrowIds.filter(id => this.isSameSupporter(id));
    this.multicastMessage(receiverIds, message);
  }

  decideResult(sellerId: PlayerId): Result {
    return Result.FAILED;
  }
}
