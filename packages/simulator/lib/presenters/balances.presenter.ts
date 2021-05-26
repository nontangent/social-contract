import { IPlayer } from "@social-contract/core/player";
import { ICommerceSystem } from "@social-contract/core/system";
import { f2 } from "@social-contract/utils/helpers";

const AsciiTable = require('ascii-table');

type MapKey = IPlayer<any> | string;

type BalancesMap = Map<MapKey, number[]>

export interface BalancesData {
  t: number;
  n: number;
  balances: BalancesMap;
}

export class BalancesPresenter {
  buildBalancesString(systemMap: Map<MapKey, ICommerceSystem>, t: number, n: number): string {
    const data = this.buildBalancesData(systemMap, t, n);
    return this.formatBalancesData(data);
  }

  buildBalancesData(systemMap: Map<MapKey, ICommerceSystem>, t: number, n: number): BalancesData {
    const balances = [...systemMap.keys()].reduce((pre, key, i) => {
      return pre.set(key, [...Array(n)].map((_, j) => systemMap.get(key)!.getBalance(j, t)));
    }, new Map() as BalancesMap);
    return {t, n, balances};
  }

  formatBalancesData(data: BalancesData): string {
    const table = new AsciiTable();
    table.setHeading(`Balances(${data.t})`, ...[...Array(data.n)].map((_, i) => `${i}`));
    [...data.balances.keys()].forEach(key => {
      const balances = data.balances.get(key)!.map(b => f2(b));
      return table.addRow(this.getKeyString(key), ...balances);
    })
    return table.toString();
  }

  getKeyString(key: MapKey): string {
    return typeof key === 'string' ? key : key.name;
  }
}
