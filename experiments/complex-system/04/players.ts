import { PlayerId, Result, PlayerStrategy, Transaction } from '@social-contract/libs/core';
import { BaseContractPlayer } from '@social-contract/libs/complex-system';

export const PLAYER_TYPES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
export type PlayerType = typeof PLAYER_TYPES[number];
export enum Support { A, B }

export abstract class BasePlayer extends BaseContractPlayer {
  abstract readonly type: PlayerType;
  abstract readonly support: Support;
  abstract readonly strategy: PlayerStrategy;

  readonly supportMap = new Map<PlayerId, Support>();

  get name(): string {
    return `Player ${this.id}(${this.type})`;
  }

}

export abstract class BaseTraitor extends BasePlayer {
  multicastRecord(escrowIds: PlayerId[] , transaction: Transaction, signs: PlayerId[] = [this.id]) {
    const message = this.buildMessage(transaction, signs);
    const playerIds = escrowIds.filter(id => {
      const player = this.addressBook.get(id)! as BasePlayer;
      return !['A', 'B', 'C', 'D'].includes(player.type);
    });
    this.multicastMessage(playerIds, message);
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

  decide(sellerId: PlayerId): boolean {
    return true;
  }
}

export class PlayerTypeC extends BasePlayer {
  readonly type: PlayerType = 'C';
  readonly support = Support.B;
  readonly strategy: PlayerStrategy = [1, 3];

  decide(sellerId: PlayerId): boolean {
    return !super.decide(sellerId);
  }
}

export class PlayerTypeD extends BasePlayer {
  readonly type: PlayerType = 'D';
  readonly support = Support.B;
  readonly strategy: PlayerStrategy = [1, 4];

  decide(sellerId: PlayerId): boolean {
    return false;
  }
}

export class PlayerTypeE extends BaseTraitor {
  readonly type: PlayerType = 'E';
  readonly support = Support.B;
  readonly strategy: PlayerStrategy = [2, 1];
}

export class PlayerTypeF extends BaseTraitor {
  readonly type: PlayerType = 'F';
  readonly support = Support.B;
  readonly strategy: PlayerStrategy = [2, 2];

  decide(sellerId: PlayerId): boolean {
    return true;
  }
}

export class PlayerTypeG extends BaseTraitor {
  readonly type: PlayerType = 'G';
  readonly support = Support.B;
  readonly strategy: PlayerStrategy = [2, 3];
  
  decide(sellerId: PlayerId): boolean {
    return !super.decide(sellerId);
  }
}

export class PlayerTypeH extends BaseTraitor {
  readonly type: PlayerType = 'H';
  readonly support = Support.B;
  readonly strategy: PlayerStrategy = [2, 4];

  decide(sellerId: PlayerId): boolean {
    return false;
  }
}
