import { Presenter } from '@social-contract/core/presenter';
import { InitialState, Balances } from '@social-contract/core/system';
import { Player, Simulator, CommerceSystem } from "@social-contract/implements/scp";

const balancesFactory = (n: number) => [...Array(n)].map((_, i) => i).reduce((p, i) => ({
  ...p, [i]: 0 
}), {} as Balances);
const initialStateFactory = (n: number) => ({balances: balancesFactory(n)});
const systemFactory = (initialState: InitialState) => new CommerceSystem(initialState);
const playerFactory = (i:number, n: number) => new Player(i, systemFactory(initialStateFactory(n)));

function main() {
  const N = 16;

  const players = [...Array(N)].map((_, i) => playerFactory(i, N));
  const presenter = new Presenter();
  // const presenter = new NoopPresenter();
  const simulator = new Simulator(players, presenter);
  simulator.run(10);
}

main();