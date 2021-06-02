import { MemoCommerceSystem, Player, IEthicalGamePlayer } from '@social-contract/libs/ethical-game';
import { initialStateFactory } from '@social-contract/libs/utils/factories';
import { randomChoice } from '@social-contract/libs/utils/helpers';
import { EthicalGamePresenter } from './presenter';
import { Simulator } from './simulator';
import '../../settings';

const PLAYER_TYPES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export type PlayerKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export interface Options {
  laps: number;
  interval: number;
  n: number;
  playersCode?: string;
}

export const defaultOption: Options = {
  laps: 20,
  interval: 0,
  n: 16,
};

export function randomPlayersCode(n: number): string {
  return [...Array(n)].map(() => randomChoice(PLAYER_TYPES)).join('');
}

export async function run({ n, playersCode, laps, interval }: Options = defaultOption) {
  playersCode = playersCode ?? randomPlayersCode(n);
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