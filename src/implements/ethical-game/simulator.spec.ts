import { CommerceSystem } from "./system";
import { Simulator } from "./simulator";
import { IPlayer } from "./player";

describe('Simulator', () => {
  it('', () => {
    const players: IPlayer[] = [];
    const system = new CommerceSystem({balances: {}});
    const simulator = new Simulator(players, system);
    simulator.run()
  });
});