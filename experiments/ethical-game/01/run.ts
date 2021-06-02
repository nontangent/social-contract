import { MemoCommerceSystem, Player, EthicalGamePlayerType, IEthicalGamePlayer } from '@social-contract/libs/ethical-game';
import { initialStateFactory } from '@social-contract/libs/utils/factories';
import { BaseEthicalGameSimulator } from '@social-contract/instruments/simulators';
import { sum } from '@social-contract/libs/utils/helpers';

import { EthicalGamePresenter } from './presenter';
import '../../settings';

import { getLogger } from 'log4js';
import { PlayerId } from '@social-contract/libs/core';
const logger = getLogger('experiments.01');

export function playersFactory(map: Record<EthicalGamePlayerType, number>): IEthicalGamePlayer[] {
  const types = Object.entries(map).map(([t, n]) => [...Array(n)].map(() => t as EthicalGamePlayerType)).flat();
  return types.map((type, i) => new Player(i, type));
}

export type PlayerKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export interface Options {
  laps: number;
  interval: number;
  playerMap: Record<PlayerKey, number>;
}

export const defaultOption: Options = {
  laps: 100,
  interval: 100,
  playerMap: { A: 8, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0 },
};

class Simulator extends BaseEthicalGameSimulator {
  description = `倫理ある商取引ゲーム(01)`;

  get playersInfo(): Record<PlayerId, string> {
    return this.players.reduce((record, player) => ({
      ...record,
      [player.id]: player.type
    }), {});
  }
  
}

export async function run({ playerMap, laps, interval }: Options = defaultOption) {
  const N = sum(Object.values(playerMap));
  const B = sum(Object.values(playerMap));
  const initialState = initialStateFactory(N, B);
  const players: IEthicalGamePlayer[] = playersFactory(playerMap);

  const system = new MemoCommerceSystem(initialState);
  const presenter = new EthicalGamePresenter()
  const simulator = new Simulator(players, system, presenter);

  await simulator.run(laps, interval);
}

function main() {
  return run();
}

if (require?.main === module) {
  main();
}