import { ICommerceSystem } from '@social-contract/core/system';
const AsciiTable = require('ascii-table');

export interface BalancesData {
  t: number;
  n: number;
  balances: {[key: string]: number[]};
}

export class SystemPresenter {
  buildBalancesData(systemMap: {[key: string]: ICommerceSystem}, t: number, n: number): BalancesData {
    const balances = Object.keys(systemMap).reduce((pre, key, i) => ({
      ...pre, 
      [key]: [...Array(n)].map((_, j) => systemMap[key].getBalance(j, t))
    }), {});
    return {t, n, balances};
  }

  buildBalancesString(data: BalancesData): string {
    const table = new AsciiTable();
    table.setHeading(`Balances(${data.t})`, ...[...Array(data.n)].map((_, i) => `${i}`));
    Object.keys(data.balances).forEach(key => {
      const balances = data.balances[key].map(b => f2(b));
      return table.addRow(key, ...balances);
    })
    return table.toString();
  }
}

export const f2 = (n: number) => Math.round(n * 10) / 10;
