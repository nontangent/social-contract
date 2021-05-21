import { PlayerId } from "@social-contract/core/player";
import { Balances, Result} from "@social-contract/core/system";
import { clone, isSetsEqual, sum } from "@social-contract/utils/helpers";
import { getLogger } from 'log4js';
import { CommerceSystem } from './commerce.system';
const logger = getLogger(__filename);


export class MemoCommerceSystem extends CommerceSystem {
  balancesCache = new Map<number, Balances>();
  balanceCache: {[key: number]: {[key: number]: number}} = {};

  successRateCache = new Map<string, [number, number]>();

  getBalances(t: number): Balances {
    const cached = this.balancesCache.get(t);
    if (cached) return {...cached};

    const balances = super.getBalances(t);
    this.balancesCache.set(t, {...balances});
    return {...balances};
  }

  // 過去の商取引ゲームで成功が報告された割合を取得
  getSuccessRate(t: number, playerId: PlayerId, opportunityId: PlayerId): [number, number] {
    const key = this.buildKey({t, playerId, opportunityId});
    const cached = this.successRateCache.get(key);
    if (cached) return clone(cached);

    const successRate = super.getSuccessRate(t, playerId, opportunityId);
    this.successRateCache.set(key, clone(successRate));
    return clone(successRate);
  }

  buildKey(obj: Object): string {
    return JSON.stringify(obj);
  }
}