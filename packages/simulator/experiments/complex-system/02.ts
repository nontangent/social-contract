import { Action } from '@social-contract/core/actor';
import { PlayerId } from '@social-contract/core/player';
import { Balances, History, InitialState, Result, Transaction } from '@social-contract/core/system';
import { MemoCommerceSystem, Player, BaseContractSimulator } from '@social-contract/complex-system';
import { IContractPlayer, MessageType } from '@social-contract/complex-system/player.interface';
import { Presenter } from './presenter';
import '../settings';

enum Support { A = 'A', B = 'B' };

interface MessageData {
  support: Support;
  transactions: Transaction[];
}

export abstract class BasePlayer extends Player {
  abstract support: Support;
  supportMap = new Map<PlayerId, Support>();

  get name(): string {
    return `Player ${this.id}(Support ${this.support})`;
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

  determineResult(sellerId: PlayerId, start: number, end: number): Result {
    const result = super.determineResult(sellerId, start, end);
    return result === Result.SUCCESS && this.supportMap.get(sellerId) === this.support ? Result.SUCCESS : Result.FAILED;
  }
}

export class PlayerTypeA extends BasePlayer {
  support = Support.A;
}

export class PlayerTypeB extends BasePlayer {
  support = Support.B;
}

export class Simulator extends BaseContractSimulator<BasePlayer> {
  getTrueResult(seller: BasePlayer, buyer: BasePlayer) {
    return seller.support === Support.A && buyer.support === Support.A ? Result.SUCCESS : Result.FAILED;
  }
}

const balancesFactory = (n: number) => [...Array(n)].map((_, i) => i).reduce((p, i) => ({...p, [i]: n}), {} as Balances);
const initialStateFactory = (n: number) => ({balances: balancesFactory(n)});
const systemFactory = (initialState: InitialState, i: number) => new MemoCommerceSystem(initialState, `${i}`);
const playerFactoryA = (i: number, n: number) => new PlayerTypeA(i, systemFactory(initialStateFactory(n), i));
const playerFactoryB = (i: number, n: number) => new PlayerTypeB(i, systemFactory(initialStateFactory(n), i));

function main() {
  const N = 8;
  const K = 5;

  const players = [
    ...[...Array(N-K)].map((_, i) => playerFactoryA(i, N)),
    ...[...Array(K)].map((_, i) => playerFactoryB(N-K+i, N)),
  ];

  const presenter = new Presenter();
  const simulator = new Simulator(players, presenter);
  simulator.run(1000, 0);
}

main();