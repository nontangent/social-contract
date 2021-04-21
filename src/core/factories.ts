export const balancesFactory = (n: number, balance: number = 10) => [...Array(n)]
  .map((_, i) => i)
  .reduce((p, i) => ({...p, [i]: balance}), {});
export const initialStateFactory = (n: number, balance: number = 10) => ({balances: balancesFactory(n, balance)});