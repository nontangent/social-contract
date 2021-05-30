import { PlayerId } from '@social-contract/libs/core/player';
import { Balances, Result } from "@social-contract/libs/core/system";
import { clone, isSetsEqual, sum } from '@social-contract/libs/utils/helpers';
import { BaseCommerceSystem, EscrowWeights } from '@social-contract/libs/ethical-game/systems/base';

import { getLogger } from 'log4js';
const logger = getLogger(__filename);

export class CommerceSystem extends BaseCommerceSystem {

  // エスクローコスト(失敗が報告された場合に没収される金額)の負担の重みを計算する
  getBurdenWeights(t: number, sellerId: PlayerId, buyerId: PlayerId): [number, number, number, number] {
    // 時刻tのTransactionがなければエラー
    const transaction = this.getTransaction(t);
    if (!transaction) throw new Error(`A transaction at time(${t}) is none.`);

    // sellerとbuyerの最低信頼度を計算する
    const sellerT = this.getMinimumTrustScore(t, sellerId, [buyerId]);
    const buyerT = this.getMinimumTrustScore(t, buyerId, [sellerId]);

    logger.debug(`sellerT: ${sellerT}, buyerT: ${buyerT}`);

    // 最低信頼度を元に負担比率を決定する
    const sellerW = this.burdenWeightFunction(sellerT);
    const buyerW = this.burdenWeightFunction(buyerT);

    return [sellerW, buyerW, sellerT, buyerT];
  }

  // エスクローコスト(失敗が報告された場合に没収される金額)の負担の割合を計算する
  getNormalizedBurdenWeights(t: number, sellerId: PlayerId, buyerId: PlayerId): [number, number] {
    // 時刻tのTransactionがなければエラー
    const transaction = this.getTransaction(t);
    if (!transaction) throw new Error(`A transaction at time(${t}) is none.`);
    
    // 
    const [sellerW, buyerW] = this.getBurdenWeights(t, sellerId, buyerId);
    return [buyerW / (sellerW + buyerW), sellerW / (sellerW + buyerW)];
  }

  // エスクローコスト(失敗が報告された場合にシステムが没収する金額の合計)を取得する
  getEscrowCost(t: number, sellerId: PlayerId, buyerId: PlayerId): number {
    // 時刻tのTransactionがなければエラー
    const transaction = this.getTransaction(t);
    if (!transaction) throw new Error(`A transaction at time(${t}) is none.`);

    // MEMO: この計算式なんだ？
    const [sellerW, buyerW, sellerT, buyerT] = this.getBurdenWeights(t, sellerId, buyerId);
    return (sellerW + buyerW) / (Math.min(buyerW, sellerW) * buyerT);
  }

  // 最低信頼度Tを取得する
  private getMinimumTrustScore(t: number, playerId: PlayerId, excludeIds: PlayerId[]) {
    // 時刻tのTransactionがなければエラー
    const transaction = this.getTransaction(t);
    if (!transaction) throw new Error(`A transaction at time(${t}) is none.`);

    // 時刻t-1のbalancesを取得
    const balances = this.getBalances(t-1);

    // 各opportunityとの商取引ゲームの成功率の荷重和をとる
    return this.getPlayerIds(excludeIds).reduce((trust, id) => {
      return trust + this.getReputationWeight(balances, id, excludeIds) * this.getSuccessRate(t, playerId, id)[0];
    }, 0);

  }

  // targetのプレイヤーのbalanceの割合を取得
  private getReputationWeight(balances: Balances, targetId: PlayerId, excludeIds: PlayerId[] = []) {
    const playerIds = this.getPlayerIds(excludeIds);
    const totalBalance = sum(playerIds.map(id => balances[id]));

    // totalBalanceが0でなければ、プレイヤーの占める割合、0の場合は1をプレイヤー数で割った数
    return totalBalance !== 0 ? balances[targetId] / totalBalance : 1 / playerIds.length;
  }

  // 過去の商取引ゲームで成功が報告された割合を取得
  getSuccessRate(t: number, playerId: PlayerId, opportunityId: PlayerId): [number, number] {
    if (playerId === opportunityId) return [1, 0];
    if (t === 0) return [1/2, 0];

    // 時刻tのTransactionがなければエラー
    const transaction = this.getTransaction(t);
    if (!transaction) throw new Error(`A transaction at time(${t}) is none.`);

    const {sellerId, buyerId, result} = transaction;
    let [successRate, count] = this.getSuccessRate(t - 1, playerId, opportunityId);
    if (isSetsEqual(new Set([sellerId, buyerId]), new Set([playerId, opportunityId]))) {
      successRate = count === 0 ? 0 : successRate;
      return [(successRate * count + (result === Result.SUCCESS ? 1 : 0)) / (count + 1), count + 1];
    } else {
      return [successRate, count];
    }
  }

  private get burdenWeightFunction(): (w: number) => number {
    return (w: number) => w;
  }

}
