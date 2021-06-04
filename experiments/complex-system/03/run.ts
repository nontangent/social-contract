// Sellerのときに送るTransactionを改ざんするプレイヤーがいる場合

import { Balances, InitialState } from '@social-contract/libs/core';
import { MemoCommerceSystem } from '@social-contract/libs/complex-system';
import { PlayerTypeA, PlayerTypeB } from './players';
import { Simulator } from './simulator';
import { Presenter } from '../presenter';
import '../../settings';

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
  simulator.run(20, 0);
}

if (require?.main === module) {
  main();
}