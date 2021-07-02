import { PlayerId } from "@social-contract/libs/core/player";
import { Balances } from "@social-contract/libs/core/system";
import { clone } from "@social-contract/libs/utils/helpers";
import { ReputationSystem } from '@social-contract/libs/ethical-game/systems/commerce';

import { getLogger } from 'log4js';
const logger = getLogger(__filename);


export class MemoReputationSystem extends ReputationSystem {
  balancesCache = new Map<number, Balances>();
  balanceCache: {[key: number]: {[key: number]: number}} = {};

  successRateCache = new Map<string, [number, number]>();

  getScores(t: number): Balances {
    const cached = this.balancesCache.get(t);
    if (cached) return {...cached};

    const balances = super.getScores(t);
    this.balancesCache.set(t, {...balances});
    return {...balances};
  }

  // 過去の商取引ゲームで成功が報告された割合を取得
  getReportedSuccessRate(t: number, playerId: PlayerId, opportunityId: PlayerId, role: 'seller' | 'buyer'): [number, number] {
    const key = this.buildKey({t, playerId, opportunityId, role});
    const cached = this.successRateCache.get(key);
    if (cached) return clone(cached);

    const successRate = super.getReportedSuccessRate(t, playerId, opportunityId, role);
    this.successRateCache.set(key, clone(successRate));
    return clone(successRate);
  }

  buildKey(obj: Object): string {
    return JSON.stringify(obj);
  }
}