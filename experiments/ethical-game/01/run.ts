import { MemoCommerceSystem, Player, IEthicalGamePlayer } from '@social-contract/libs/ethical-game';
import { initialStateFactory } from '@social-contract/libs/utils/factories';
import { randomChoice } from '@social-contract/libs/utils/helpers';
import { EthicalGamePresenter } from './presenter';
import { Simulator } from './simulator';
import '../../settings';
import { NoopPresenter } from '@social-contract/instruments/presenters';

const PLAYER_TYPES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export type PlayerKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export interface Options {
  laps: number;
  interval: number;
  n: number;
  honestNum?: number,
  presentation: boolean;
  playersCode?: string;
}

export const defaultOption: Options = {
  laps: 20,
  interval: 0,
  n: 16,
  presentation: true,
};

export function randomPlayersCode(n: number, honestNum?: number): string {
  let players = [...Array(n)].map(() => randomChoice(PLAYER_TYPES));
  while (honestNum !== undefined && players.filter(p => p === 'A').length !== honestNum) {
    players = [...Array(n)].map(() => randomChoice(PLAYER_TYPES));
  }
  return players.join('');
}

export async function run(options: Options = defaultOption) {
  let playersCode = options.playersCode ?? randomPlayersCode(options.n, options.honestNum);
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