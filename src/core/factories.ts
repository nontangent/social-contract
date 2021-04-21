export const balancesFactory = (n: number) => [...Array(n)].map((_, i) => i).reduce((p, i) => ({...p, [i]: 1}), {});
export const initialStateFactory = (n: number) => ({balances: balancesFactory(n)});