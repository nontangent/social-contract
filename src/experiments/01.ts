import { IPlayer, CommerceSystem, Simulator, Player } from '@social-contract/implements/ethical-game';

export const initialState = {
  balances: {
    0: 1
  }
}

function main() {
  const players: IPlayer[] = [...Array(16)].map((_, i) => new Player(i, [1, 1]));
  const system = new CommerceSystem(initialState);
  const simulator = new Simulator(players, system);
  simulator.run();
}

main();