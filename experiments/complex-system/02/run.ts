import { Balances, InitialState } from '@social-contract/libs/core';
import { MemoCommerceSystem } from '@social-contract/libs/complex-system';
import { randomPlayersCode } from '@social-contract/instruments/utils';
import { BasePlayer, PlayerType, PLAYER_TYPES, PlayerTypeA, PlayerTypeB, PlayerTypeC, PlayerTypeD, PlayerTypeE, PlayerTypeF, PlayerTypeG, PlayerTypeH } from './players';
import { Simulator } from './simulator';
import { Presenter } from '../presenter';
import '../../settings';
import { NoopPresenter } from '@social-contract/instruments/presenters';
import { defaultOption, Options } from '@social-contract/experiments/options';

const balancesFactory = (n: number) => [...Array(n)].map((_, i) => i).reduce((p, i) => ({...p, [i]: n}), {} as Balances);
const initialStateFactory = (n: number) => ({balances: balancesFactory(n)});
const systemFactory = (initialState: InitialState, i: number) => new MemoCommerceSystem(initialState, `${i}`);
const playerFactory = (type: PlayerType, i: number, n: number) => {
  const system = systemFactory(initialStateFactory(n), i)
  switch (type) {
    case 'A': return new PlayerTypeA(i, system);
    case 'B': return new PlayerTypeB(i, system);
    case 'C': return new PlayerTypeC(i, system);
    case 'D': return new PlayerTypeD(i, system);
    case 'E': return new PlayerTypeE(i, system);
    case 'F': return new PlayerTypeF(i, system);
    case 'G': return new PlayerTypeG(i, system);
    case 'H': return new PlayerTypeH(i, system);
  }
}

export async function run(options: Options = defaultOption) {
  const fixed = options?.honestNum ? {type: 'A', n: options.honestNum} : undefined;
  const playersCode = randomPlayersCode(PLAYER_TYPES.map(c => c), options.n, fixed);
  console.debug('playersCode:', playersCode);

  const N = playersCode.length;
  const players: BasePlayer[] = [...playersCode].map((type, i) => playerFactory(type as PlayerType, i, N));
  const presenter = options.presentation ? new Presenter() : new NoopPresenter();

  const simulator = new Simulator(players, presenter);
  await simulator.run(options.laps, options.interval);
}

if (require?.main === module) {
  run();
}