import { ICommerceSystem } from "@social-contract/core/system";
import { f2 } from "@social-contract/utils/helpers";

const AsciiTable = require('ascii-table');

export interface BalancesData {
  t: number;
  n: number;
  balances: {[key: string]: number[]};
}

export class BalancesPresenter {
  buildBalancesString(systemMap: {[key: string]: ICommerceSystem}, t: number, n: number): string {
    const data = this.buildBalancesData(systemMap, t, n);
    return this.formatBalancesData(data);
  }

  buildBalancesData(systemMap: {[key: string]: ICommerceSystem}, t: number, n: number): BalancesData {
    const balances = Object.keys(systemMap).reduce((pre, key, i) => ({
      ...pre, 
      [key]: [...Array(n)].map((_, j) => systemMap[key].getBalance(j, t))
    }), {});
    return {t, n, balances};
  }

  formatBalancesData(data: BalancesData): string {
    const table = new AsciiTable();
    table.setHeading(`Balances(${data.t})`, ...[...Array(data.n)].map((_, i) => `${i}`));
    Object.keys(data.balances).forEach(key => {
      const balances = data.balances[key].map(b => f2(b));
      return table.addRow(key, ...balances);
    })
    return table.toString();
  }
}
