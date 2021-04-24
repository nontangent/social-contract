import { InitialState, Balances } from '@social-contract/core/system';
import { Player, Simulator, MemoCommerceSystem } from '@social-contract/implements/scp';
import { Presenter } from '@social-contract/implements/scp/presenter';
import './settings';


const balancesFactory = (n: number) => [...Array(n)].map((_, i) => i)
  .reduce((p, i) => ({...p, [i]: n}), {} as Balances);
const initialStateFactory = (n: number) => ({balances: balancesFactory(n)});
const systemFactory = (initialState: InitialState) => new MemoCommerceSystem(initialState);
const playerFactory = (i: number, n: number) => new Player(i, systemFactory(initialStateFactory(n)));

function main() {
  const N = 3;

  const players = [...Array(N)].map((_, i) => playerFactory(i, N));

  const presenter = new Presenter();
  // const presenter = new NoopPresenter();
  const simulator = new Simulator(players, presenter);
  simulator.run(1000);
}

main();