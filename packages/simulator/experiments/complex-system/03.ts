// Sellerのときに送るTransactionを改ざんするプレイヤーがいる場合

import { PlayerId } from '@social-contract/core/player';
import { Balances, InitialState, Result, Transaction } from '@social-contract/core/system';
import { MemoCommerceSystem, Player, BaseContractSimulator } from '@social-contract/complex-system';
import { IContractPlayer, MessageType } from '@social-contract/complex-system/player.interface';
import { Presenter } from './presenter';
import '../settings';

enum PlayerType { A = 'A', B = 'B' };

abstract class BasePlayer extends Player {
  abstract type: PlayerType;

  get name(): string {
    return `Player ${this.id}(Contract ${this.type})`;
  }

}

class PlayerTypeA extends BasePlayer {
  type = PlayerType.A;
}

class PlayerTypeB extends BasePlayer {
  type = PlayerType.B;

  sendGoodsMessage(receiver: IContractPlayer, transactions: Transaction[]) {
    transactions = transactions.map(t => ({...t, result: Result.FAILED}));
    const message = { type: MessageType.GOODS, data: transactions };
    this.sendMessage(receiver, message);
    return message;
  }
}

export class Simulator extends BaseContractSimulator<BasePlayer> {
  getTrueResult(seller: BasePlayer, buyer: BasePlayer): Result {
    return seller.type === PlayerType.A && buyer.type === PlayerType.A ? Result.SUCCESS : Result.FAILED;
  }
}

const balancesFactory = (n: number) => [...Array(n)].map((_, i) => i).reduce((p, i) => ({...p, [i]: n}), {} as Balances);
const initialStateFactory = (n: number) => ({balances: balancesFactory(n)});
const systemFactory = (initialState: InitialState, i: number) => new MemoCommerceSystem(initialState, `${i}`);
const playerFactoryA = (i: number, n: number) => new PlayerTypeA(i, systemFactory(initialStateFactory(n), i));
const playerFactoryB = (i: number, n: number) => new PlayerTypeB(i, systemFactory(initialStateFactory(n), i));

function main() {
  const N = 4;
  const K = 1;

  const players = [
    ...[...Array(N-K)].map((_, i) => playerFactoryA(i, N)),
    ...[...Array(K)].map((_, i) => playerFactoryB(N-K+i, N)),
  ];

  const presenter = new Presenter();
  const simulator = new Simulator(players, presenter);
  simulator.run(1000, 0);
}

main();