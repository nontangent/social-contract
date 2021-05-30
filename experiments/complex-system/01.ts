import { PlayerId } from '@social-contract/libs/core/player';
import { InitialState, Balances, Result } from '@social-contract/libs/core/system';
import { BaseContractPlayer, MemoCommerceSystem } from '@social-contract/libs/complex-system';
import { BaseContractSimulator } from '@social-contract/instruments/simulators';
import { Presenter } from './presenter';
import '../settings';

class PlayerA extends BaseContractPlayer {
  get name(): string {
    return `Player ${this.id}(Contract A)`
  }
}

class PlayerB extends BaseContractPlayer {
  get name(): string {
    return `Player ${this.id}(Contract B)`
  }

  determineResult(sellerId: PlayerId, start: number, end: number): Result {
    const result = super.determineResult(sellerId, start, end);
    return result === Result.SUCCESS ? Result.FAILED : Result.SUCCESS;
  }
}

class Simulator extends BaseContractSimulator<BaseContractPlayer> {
  getTrueResult(seller: BaseContractPlayer, buyer: BaseContractPlayer): Result {
    return Result.SUCCESS;
  }
}


const balancesFactory = (n: number) => [...Array(n)].map((_, i) => i)
  .reduce((p, i) => ({...p, [i]: n}), {} as Balances);
const initialStateFactory = (n: number) => ({balances: balancesFactory(n)});
const systemFactory = (initialState: InitialState, i: number) => new MemoCommerceSystem(initialState, `${i}`);
const playerFactoryA = (i: number, n: number) => new PlayerA(i, systemFactory(initialStateFactory(n), i));
const playerFactoryB = (i: number, n: number) => new PlayerB(i, systemFactory(initialStateFactory(n), i));

function main() {
  const N = 8;
  const K = 0;

  const players = [
    ...[...Array(N-K)].map((_, i) => playerFactoryA(i, N)),
    ...[...Array(K)].map((_, i) => playerFactoryB(N-K+i, N)),
  ];

  const presenter = new Presenter();

  const simulator = new Simulator(players, presenter);
  simulator.run(1000, 10);
}

main();