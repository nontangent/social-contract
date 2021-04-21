import { IPlayer, MemoCommerceSystem, Simulator, Player } from '@social-contract/implements/ethical-game';
import { initialStateFactory } from '@social-contract/core/factories';

function main() {
  const N = 2;
  const initialState = initialStateFactory(N);
  console.debug('initialState:', initialState);
  const players: IPlayer[] = [...Array(N)].map((_, i) => new Player(i, [1, 1]));
  // const system = new CommerceSystem(initialState);
  const system = new MemoCommerceSystem(initialState);
  const simulator = new Simulator(players, system);
  simulator.run();
}

main();