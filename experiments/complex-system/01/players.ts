import { PlayerId } from '@social-contract/libs/core/player';
import { Result } from '@social-contract/libs/core/system';
import { BaseContractPlayer } from '@social-contract/libs/complex-system';

export const PlayerTypes = ['A', 'B'] as const;
export type PlayerType = typeof PlayerTypes[number];

export abstract class BasePlayer extends BaseContractPlayer {
  abstract type: PlayerType;
}

export class PlayerA extends BasePlayer {
  type: PlayerType = 'A';

  get name(): string {
    return `Player ${this.id}(Contract ${this.type})`;
  }
}

export class PlayerB extends BasePlayer {
  type: PlayerType = 'B';

  get name(): string {
    return `Player ${this.id}(Contract ${this.type})`;
  }

  determineResult(sellerId: PlayerId, start: number, end: number): Result {
    const result = super.determineResult(sellerId, start, end);
    return result === Result.SUCCESS ? Result.FAILED : Result.SUCCESS;
  }
}