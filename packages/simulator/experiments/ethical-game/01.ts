import { EthicalGamePlayerType, IEthicalGamePlayer } from '@social-contract/ethical-game/player.interface';
import { MemoCommerceSystem, Simulator, Player, CommerceSystem } from '@social-contract/ethical-game';
import { initialStateFactory } from '@social-contract/utils/factories';
import '../settings';
import { EthicalGamePresenter } from './presenter';
import { getLogger } from 'log4js';
import { sum } from '@social-contract/utils/helpers';
const logger = getLogger('experiments.01');

export function playersFactory(map: Record<EthicalGamePlayerType, number>): IEthicalGamePlayer[] {
  const types = Object.entries(map).map(([t, n]) => [...Array(n)].map(() => t as EthicalGamePlayerType)).flat();
  return types.map((type, i) => new Player(i, type));
}

function main() {
  const playerMap = {
    A: 8, B: 0, C: 0, D: 0,
    E: 0, F: 0, G: 0, H: 0,
  };

  const N = sum(Object.values(playerMap));
  const B = sum(Object.values(playerMap));
  const MAX_T = 100;
  const initialState = initialStateFactory(N, B);
  const players: IEthicalGamePlayer[] = playersFactory(playerMap);

  // const system = new CommerceSystem(initialState);
  const system = new MemoCommerceSystem(initialState);
  const presenter = new EthicalGamePresenter()
  const simulator = new Simulator(players, system, presenter);
  simulator.run(MAX_T, 0);
}

main();