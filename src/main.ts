import { Player } from "./player";
import { Simulator } from "./simulator";
import { CommerceSystem } from "./system";

const systemFactory = () => new CommerceSystem({balances: {}});
const playerFactory = (i: number) => new Player(i, systemFactory());

function main() {
  const players = [...Array(16)].map((_, i) => playerFactory(i));
  const simulator = new Simulator(players);
  simulator.run();
}

main();