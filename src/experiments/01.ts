import { IPlayer, MemoCommerceSystem, Simulator, Player } from '@social-contract/implements/ethical-game';
import { initialStateFactory } from '@social-contract/core/factories';
import { getLogger } from '@social-contract/core/logging';
const logger = getLogger('experiments.01');

const PlayerFactoryA = (i: number) => new Player(i, [1, 1]);
const PlayerFactoryB = (i: number) => new Player(i, [1, 2]);
const PlayerFactoryC = (i: number) => new Player(i, [1, 3]);
const PlayerFactoryD = (i: number) => new Player(i, [1, 4]);
const PlayerFactoryE = (i: number) => new Player(i, [2, 1]);
const PlayerFactoryF = (i: number) => new Player(i, [2, 2]);
const PlayerFactoryG = (i: number) => new Player(i, [2, 3]);
const PlayerFactoryH = (i: number) => new Player(i, [2, 4]);

function main() {
  const N = 16;
  const B = 16;
  const MAX_T = 100;
  const initialState = initialStateFactory(N, B);
  logger.debug('initialState:', initialState);
  const players: IPlayer[] = [];

  players.push(PlayerFactoryA(0));
  players.push(PlayerFactoryA(1));
  players.push(PlayerFactoryA(2));
  players.push(PlayerFactoryA(3));
  players.push(PlayerFactoryA(4));
  players.push(PlayerFactoryC(5));
  players.push(PlayerFactoryD(6));
  players.push(PlayerFactoryD(7));
  players.push(PlayerFactoryE(8));
  players.push(PlayerFactoryE(9));
  players.push(PlayerFactoryF(10));
  players.push(PlayerFactoryF(11));
  players.push(PlayerFactoryG(12));
  players.push(PlayerFactoryG(13));
  players.push(PlayerFactoryB(14));
  players.push(PlayerFactoryB(15));


  logger.debug('players.length:', players.length);

  // const system = new CommerceSystem(initialState);
  const system = new MemoCommerceSystem(initialState);
  const simulator = new Simulator(players, system);
  simulator.run(MAX_T);
}

main();