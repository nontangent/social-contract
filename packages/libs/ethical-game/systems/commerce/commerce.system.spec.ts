import { Result } from "@social-contract/libs/core/system";
import { CommerceSystem } from "./system";

describe('System', () => {
  it('getAllPlayerIds()', () => {
    const initialState = {balances: {0: 1, 1: 1}};
    const system = new CommerceSystem(initialState);
    const output = system.getPlayerIds();
    expect(output).toEqual([0, 1]);
  });

  it('getTotalAmount()', () => {
    const initialState = {balances: {0: 1, 1: 1}};
    const system = new CommerceSystem(initialState);
    const output = system['getTotalAmount'](initialState.balances);
    expect(output).toEqual(2);
  });

  it('getBalances()', () => {
    const initialState = {balances: {0: 1, 1: 1}};
    const system = new CommerceSystem(initialState);
    const output = system['getBalances'](0);
    expect(output).toEqual(initialState.balances);
  });

  it('getBalance(1, 0)', () => {
    const initialState = {balances: {0: 1, 1: 1}};
    const system = new CommerceSystem(initialState);
    const output = system.getBalance(1, 0);
    expect(output).toEqual(1);
  });

  it('getBalance(1, 0)', () => {
    const initialState = {balances: {0: 3, 1: 3, 2: 3}};
    const system = new CommerceSystem(initialState);
    system.setTransaction({ t: 1, sellerId: 0, buyerId: 1, result: Result.SUCCESS });
    system.setTransaction({ t: 2, sellerId: 0, buyerId: 2, result: Result.SUCCESS });
    system.setTransaction({ t: 3, sellerId: 1, buyerId: 0, result: Result.SUCCESS });
    let output = system.getBalance(0, 0);
    output = system.getBalance(0, 0);
    expect(output).toEqual(3);
  });

  it('getReputationWeight(): balancesの合計が0でない場合', () => {
    const initialState = {balances: {0: 1, 1: 1}};
    const system = new CommerceSystem(initialState);
    const balances = {0: 1, 1: 1};
    const output = system['getReputationWeight'](balances, 0, []);
    expect(output).toEqual(1/2);
  });

  it('getReputationWeight(): balancesの合計が0の場合', () => {
    const initialState = {balances: {0: 1, 1: 1, 2: 1}};
    const system = new CommerceSystem(initialState);
    const balances = {0: 0, 1: 0, 2: 0};
    const output = system['getReputationWeight'](balances, 0, []);
    expect(output).toEqual(1/3);
  });

  it('n', () => {
    const initialState = {balances: {0: 1, 1: 1, 2: 1}};
    const system = new CommerceSystem(initialState);
    const output = system.n;
    expect(output).toEqual(3);
  });
});