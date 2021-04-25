import { range } from './range';

describe('range(start, end) test', () => {
  it('range(0, 5)', () => {
    const output = range(0, 5);
    expect(output).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('range(-5, 0)', () => {
    const output = range(-5, 0);
    expect(output).toEqual([-5, -4, -3, -2, -1, 0]);
  })

  it('range(7,9)', () => {
    const output = range(7, 9);
    expect(output).toEqual([7, 8, 9]);
  });
});