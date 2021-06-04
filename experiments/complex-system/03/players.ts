
import { Result, Transaction } from '@social-contract/libs/core';
import { BaseContractPlayer, MessageType } from '@social-contract/libs/complex-system';

export const playerTypes = ['A', 'B'] as const;
export type PlayerType = typeof playerTypes[number];

export abstract class BasePlayer extends BaseContractPlayer {
  abstract type: PlayerType;

  get name(): string {
    return `Player ${this.id}(Contract ${this.type})`;
  }
}

export class PlayerTypeA extends BasePlayer {
  readonly type: PlayerType = 'A';
}

export class PlayerTypeB extends BasePlayer {
  readonly type: PlayerType = 'B';

  sendGoodsMessage(receiver: BasePlayer, transactions: Transaction[]) {
    transactions = transactions.map(t => ({...t, result: Result.FAILED}));
    const message = { type: MessageType.GOODS, data: transactions };
    this.sendMessage(receiver, message);
    return message;
  }
}
