import { EthicalGamePlayerType, IEthicalGamePlayer } from '@social-contract/implements/ethical-game/player.interface';
import { MemoCommerceSystem, Simulator, Player, Presenter } from '@social-contract/implements/ethical-game';
import { initialStateFactory } from '@social-contract/core/factories';
import './settings';
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
  const presenter = new Presenter()
  const simulator = new Simulator(players, system, presenter);
  simulator.run(MAX_T);
}

main();