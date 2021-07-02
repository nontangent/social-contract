import { InitialState, Balances } from '@social-contract/libs/core/system';
import { MemoCommerceSystem } from '@social-contract/libs/complex-system';
import { Presenter } from '../presenter';
import { PlayerA, PlayerB } from './players';
import { Simulator } from './simulator';
import '../../settings';

const balancesFactory = (n: number) => [...Array(n)].map((_, i) => i)
  .reduce((p, i) => ({...p, [i]: n}), {} as Balances);
const initialStateFactory = (n: number) => ({balances: balancesFactory(n)});
const systemFactory = (initialState: InitialState, i: number) => new MemoCommerceSystem(initialState, `${i}`);
const playerFactoryA = (i: number, n: number) => new PlayerA(i, systemFactory(initialStateFactory(n), i));
const playerFactoryB = (i: number, n: number) => new PlayerB(i, systemFactory(initialStateFactory(n), i));

export async function run() {
  const N = 8;
  const K = 2;

  const players = [
    ...[...Array(N-K)].map((_, i) => playerFactoryA(i, N)),
    ...[...Array(K)].map((_, i) => playerFactoryB(N-K+i, N)),
  ];

  const presenter = new Presenter();
  const simulator = new Simulator(players, presenter);

  await simulator.run(100, 100);
}


if (require?.main === module) {
  run();
}