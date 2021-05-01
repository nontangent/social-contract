import { PlayerId } from '@social-contract/core/player';
import { InitialState, Balances, Result } from '@social-contract/core/system';
import { Player, Simulator, MemoCommerceSystem, CommerceSystem, CompareSystem } from '@social-contract/complex-system';
import { Presenter } from './presenter';
import '../settings';

export class PlayerTypeB extends Player {
  determineResult(sellerId: PlayerId, start: number, end: number): Result {
    // return Result.SUCCESS
    const result = super.determineResult(sellerId, start, end);
    return result === Result.SUCCESS ? Result.FAILED : Result.SUCCESS;
  }
}


const balancesFactory = (n: number) => [...Array(n)].map((_, i) => i)
  .reduce((p, i) => ({...p, [i]: n}), {} as Balances);
const initialStateFactory = (n: number) => ({balances: balancesFactory(n)});
// const systemFactory = (initialState: InitialState) => new MemoCommerceSystem(initialState);
// const systemFactory = (initialState: InitialState) => new CommerceSystem(initialState);
const systemFactory = (initialState: InitialState) => {
  return new CompareSystem([
    // new CommerceSystem(initialState),
    new MemoCommerceSystem(initialState)
  ]);
};
const playerFactoryA = (i: number, n: number) => new Player(i, systemFactory(initialStateFactory(n)));
const playerFactoryB = (i: number, n: number) => new PlayerTypeB(i, systemFactory(initialStateFactory(n)));

function main() {
  const N = 4;
  const K = 1;

  let players = [...Array(N-K)].map((_, i) => playerFactoryA(i, N));
  players = players.concat([...Array(K)].map((_, i) => playerFactoryB(N-K+i, N)));
  console.debug('players:', players);
  // process.exit();

  const presenter = new Presenter();
  // const presenter = new NoopPresenter();

  const simulator = new Simulator(players, presenter);
  simulator.run(1000, 100);
}

main();