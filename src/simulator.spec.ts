import { Simulator } from './simulator';

describe('Simulator Test', () => {
  it('Simulator initialize Test', () => {
    const simulator = new Simulator(10);
  });

  it('playerの商取引ゲームの順番を決定', () => {
    const simulator = new Simulator(3);
    const combs = simulator.generateCombinations();
    expect(combs).toEqual([ [ 0, 1 ], [ 0, 2 ], [ 1, 0 ], [ 1, 2 ], [ 2, 0 ], [ 2, 1 ] ])
  });

  it('simulator.run()のテスト', () => {
    const simulator = new Simulator(3);
    simulator.run()
  });
});