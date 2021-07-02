import { ReputationSystem } from "./system";
import { Simulator } from "./simulator";
import { IEthicalGamePlayer } from "./player.interface";

describe('Simulator', () => {
  it('', () => {
    const players: IEthicalGamePlayer[] = [];
    const system = new ReputationSystem({balances: {}});
    const simulator = new Simulator(players, system);
    simulator.run()
  });
});