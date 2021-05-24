import { PlayerId } from '@social-contract/core/player';
import { InitialState, Balances, Result } from '@social-contract/core/system';
import { Player, Simulator, MemoCommerceSystem, CommerceSystem, CompareSystem } from '@social-contract/complex-system';
import { Presenter } from './presenter';
import '../settings';

export class PlayerA extends Player {
  get name(): string {
    return `Player ${this.id}(Contract A)`
  }
}

export class PlayerB extends Player {
  get name(): string {
    return `Player ${this.id}(Contract B)`
  }

  determineResult(sellerId: PlayerId, start: number, end: number): Result {
    // return Result.SUCCESS
    const result = super.determineResult(sellerId, start, end);
    return result === Result.SUCCESS ? Result.FAILED : Result.SUCCESS;
    // return Result.FAILED;
  }
}


const balancesFactory = (n: number) => [...Array(n)].map((_, i) => i)
  .reduce((p, i) => ({...p, [i]: n}), {} as Balances);
const initialStateFactory = (n: number) => ({balances: balancesFactory(n)});
// const systemFactory = (initialState: InitialState) => new MemoCommerceSystem(initialState);
// const systemFactory = (initialState: InitialState) => new CommerceSystem(initialState);
const systemFactory = (initialState: InitialState, i: number) => {
  return new CompareSystem([
    // new CommerceSystem(initialState),
    new MemoCommerceSystem(initialState)
  ], `${i}`);
};
const playerFactoryA = (i: number, n: number) => new PlayerA(i, systemFactory(initialStateFactory(n), i));
const playerFactoryB = (i: number, n: number) => new PlayerB(i, systemFactory(initialStateFactory(n), i));

function main() {
  const N = 8;
  const K = 4;

  let players = [...Array(N-K)].map((_, i) => playerFactoryA(i, N));
  players = players.concat([...Array(K)].map((_, i) => playerFactoryB(N-K+i, N)));
  console.debug('players:', players);
  // process.exit();

  const presenter = new Presenter();
  // const presenter = new NoopPresenter();

  const simulator = new Simulator(players, presenter);
  simulator.run(1000, 0);
}

main();