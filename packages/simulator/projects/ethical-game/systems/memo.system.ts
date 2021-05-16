import { Balances} from "@social-contract/core/system";
import { getLogger } from 'log4js';
import { CommerceSystem } from './commerce.system';
const logger = getLogger(__filename);


export class MemoCommerceSystem extends CommerceSystem {
  balancesCache = new Map<number, Balances>();
  balanceCache: {[key: number]: {[key: number]: number}} = {};

  getBalances(t: number): Balances {
    const cached = this.balancesCache.get(t);
    if (cached) return {...cached};

    const balances = super.getBalances(t);
    this.balancesCache.set(t, {...balances});
    return {...balances};
  }
}