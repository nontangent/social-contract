import { EthicalGamePlayerType, IEthicalGamePlayer } from '@social-contract/ethical-game/player.interface';
import { MemoCommerceSystem, Simulator, Player } from '@social-contract/ethical-game';
import { initialStateFactory } from '@social-contract/utils/factories';
import '../settings';
import { EthicalGamePresenter } from './presenter';
import { getLogger } from 'log4js';
const logger = getLogger('experiments.01');

export function playersFactory(map: Record<EthicalGamePlayerType, number>): IEthicalGamePlayer[] {
  const types = Object.entries(map).map(([t, n]) => [...Array(n)].map(() => t as EthicalGamePlayerType)).flat();
  return types.map((type, i) => new Player(i, type));
}

function main() {
  const N = 16;
  const B = 16;
  const MAX_T = 100;
  const initialState = initialStateFactory(N, B);
  logger.debug('initialState:', initialState);

  const players: IEthicalGamePlayer[] = playersFactory({
    A: 3, B: 2, C: 1, D: 2,
    E: 2, F: 2, G: 2, H: 2,
  });

  logger.debug('players.length:', players.length);

  // const system = new CommerceSystem(initialState);
  const system = new MemoCommerceSystem(initialState);
  const presenter = new EthicalGamePresenter()
  const simulator = new Simulator(players, system, presenter);
  simulator.run(MAX_T, 100);
}

main();