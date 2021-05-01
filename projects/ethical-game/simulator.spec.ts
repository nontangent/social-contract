import { CommerceSystem } from "./system";
import { Simulator } from "./simulator";
import { IEthicalGamePlayer } from "./player.interface";

describe('Simulator', () => {
  it('', () => {
    const players: IEthicalGamePlayer[] = [];
    const system = new CommerceSystem({balances: {}});
    const simulator = new Simulator(players, system);
    simulator.run()
  });
});