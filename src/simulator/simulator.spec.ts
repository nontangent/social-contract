import { Player } from './player';
import { Simulator } from './simulator';
import { CommerceSystem } from './system';

describe('Simulator Test', () => {
  const systemFactory = () => new CommerceSystem({balances: {}});
  const playerFactory = (i: number) => new Player(i, systemFactory());

  it('Simulator initialize Test', () => {
    const players = [...Array(10)].map((_, i) => playerFactory(i));
    const simulator = new Simulator(players);
  });

  it('playerの商取引ゲームの順番を決定', () => {
    const players = [...Array(3)].map((_, i) => playerFactory(i));
    const simulator = new Simulator(players);
    const combs = simulator['generateCombinations']();
    expect(combs).toEqual([ [ 0, 1 ], [ 0, 2 ], [ 1, 0 ], [ 1, 2 ], [ 2, 0 ], [ 2, 1 ] ]);
  });

  it('simulator.run()のテスト', () => {
    const players = [...Array(3)].map((_, i) => playerFactory(i));
    const simulator = new Simulator(players);
    simulator.run();
  });
});