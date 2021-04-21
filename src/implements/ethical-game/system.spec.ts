import { CommerceSystem } from "./system";

describe('System', () => {
  it('getAllPlayerIds()', () => {
    const initialState = {balances: {0: 1, 1: 1,}};
    const system = new CommerceSystem(initialState);
    const output = system['allPlayerIds'];
    expect(output).toEqual([0, 1]);
  });

  it('getTotalBalance', () => {
    const initialState = {balances: {0: 1, 1: 1,}};
    const system = new CommerceSystem(initialState);
    const output = system['getTotalBalance'](0);
    expect(output).toEqual(2);
  });
});