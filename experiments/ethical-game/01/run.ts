import { MemoCommerceSystem, Player, IEthicalGamePlayer } from '@social-contract/libs/ethical-game';
import { initialStateFactory } from '@social-contract/libs/utils/factories';
import { NoopPresenter } from '@social-contract/instruments/presenters';
import { randomPlayersCode } from '@social-contract/instruments/utils';

import { EthicalGamePresenter } from './presenter';
import { Simulator } from './simulator';
import '../../settings';
import { Options } from '../../options';

const PLAYER_TYPES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export type PlayerKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export const defaultOption: Options = {
  laps: 20,
  interval: 100,
  n: 16,
  presentation: true,
  sample: 1,
  multi: 1,
};

export async function run(options: Options = defaultOption) {
  const fixed = options?.honestNum ? {type: 'A', n: options.honestNum} : undefined;
  const playersCode = options.playersCode ?? randomPlayersCode(PLAYER_TYPES, options.n, fixed);
  console.debug('playersCode:', playersCode);
  const N = playersCode.length;
  const B = N;
  const initialState = initialStateFactory(N, B);
  const players: IEthicalGamePlayer[] = [];

  playersCode.split('').map((type, i) => {
    if (!PLAYER_TYPES.includes(type)) throw Error('Player code is invalid!');
    players.push(new Player(i, type as PlayerKey))
  });

  const system = new MemoCommerceSystem(initialState);
  const presenter = options.presentation ? new EthicalGamePresenter() : new NoopPresenter();
  const simulator = new Simulator(players, system, presenter);

  await simulator.run(options.laps, options.interval);
}

function main() {
  return run();
}

if (require?.main === module) {
  main();
}