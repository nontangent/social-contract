import { PlayerId } from '@social-contract/core/player';
import { Balances, Result } from "@social-contract/core/system";
import { isSetsEqual, sum } from '@social-contract/utils/helpers';
import { getLogger } from 'log4js';
import { BaseCommerceSystem, EscrowWeights } from './base.system';
const logger = getLogger(__filename);

export class CommerceSystem extends BaseCommerceSystem {

  // エスクローコスト(失敗が報告された場合に没収される金額)の負担の重みを計算する
  getBurdenWeights(balances: Balances, sellerId: PlayerId, buyerId: PlayerId): [number, number, number, number] {
    // sellerとbuyerの最低信頼度を計算する
    const sellerT = this.getMinimumTrustScore(balances, sellerId, [buyerId]);
    const buyerT = this.getMinimumTrustScore(balances, buyerId, [sellerId]);

    logger.debug(`sellerT: ${sellerT}, buyerT: ${buyerT}`);

    // 最低信頼度を元に負担比率を決定する
    const sellerW = this.burdenWeightFunction(sellerT);
    const buyerW = this.burdenWeightFunction(buyerT);

    return [sellerW, buyerW, sellerT, buyerT];
  }

  // エスクローコスト(失敗が報告された場合に没収される金額)の負担の割合を計算する
  getNormalizedBurdenWeights(balances: Balances, sellerId: PlayerId, buyerId: PlayerId): [number, number] {
    const [sellerW, buyerW] = this.getBurdenWeights(balances, sellerId, buyerId);
    return [buyerW / (sellerW + buyerW), sellerW / (sellerW + buyerW)];
  }

  // エスクローコスト(失敗が報告された場合にシステムが没収する金額の合計)を取得する
  getEscrowCost(balances: Balances, sellerId: PlayerId, buyerId: PlayerId): number {
    const [sellerW, buyerW, sellerT, buyerT] = this.getBurdenWeights(balances, sellerId, buyerId);
    // MEMO: この計算式なんだ？
    return (sellerW + buyerW) / (Math.min(buyerW, sellerW) * buyerT);
  }

  // システムに失敗が報告された場合に没収される額を各プレイヤーに分配する重みを取得する
  getEscrowWeights(balances: Balances, excludeIds: PlayerId[]): EscrowWeights {
    const escrowIds = this.getPlayerIds(excludeIds);
    return escrowIds.reduce((p, id) => ({...p, [id]: this.getReputationWeight(balances, id, excludeIds)}), {} as EscrowWeights);
  }

  // 最低信頼度Tを取得する
  private getMinimumTrustScore(balances: Balances, playerId: PlayerId, excludeIds: PlayerId[]) {
    // 
    let trust = this.getReputationWeight(balances, playerId);

    // TODO: 逐次処理に変更
    // playerが過去に商取引ゲームを行った相手の一覧を作成する
    const opportunityIds = new Set<PlayerId>();
    for (const transaction of Object.values(this.store.getHistory())) {
      if (transaction.sellerId === playerId) {
        opportunityIds.add(transaction.buyerId)
      } else if (transaction.buyerId === playerId) {
        opportunityIds.add(transaction.sellerId)
      }
    }

    // 各opportunityとの商取引ゲームの成功率の荷重和をとる
    for (const opportunityId of [...opportunityIds].filter(id => !excludeIds.includes(id))) {
      trust += this.getReputationWeight(balances, opportunityId) * this.getSuccessRate(playerId, opportunityId);
    }

    return trust;
  }

  // targetのプレイヤーのbalanceの割合を取得
  private getReputationWeight(balances: Balances, targetId: PlayerId, excludeIds: PlayerId[] = []) {
    const playerIds = this.getPlayerIds(excludeIds);
    const totalBalance = sum(playerIds.map(id => balances[id]));

    // totalBalanceが0でなければ、プレイヤーの占める割合、0の場合は1をプレイヤー数で割った数
    return totalBalance !== 0 ? balances[targetId] / totalBalance : 1 / playerIds.length;
  }

  // TODO: 逐次処理に修正
  // 過去の商取引ゲームで成功が報告された割合を取得
  private getSuccessRate(playerId: PlayerId, opportunityId: PlayerId): number {
    // playerとopportunity間で間で行われた商取引の結果のリストを作成する
    const results: Result[] = Object.values(this.store.getHistory())
      .filter(t => isSetsEqual(new Set([t.sellerId, t.buyerId]), new Set([playerId, opportunityId])))
      .map(t => t.result);

    // 商取引の件数を入れる
    const c = results.length;
    
    // SuccessRateが0の問題は良いのか？
    return c ? sum(results.map(r => r === Result.SUCCESS ? 1 : 0)) / c : 0;
  }

  private get burdenWeightFunction(): (w: number) => number {
    return (w: number) => w;
  }

}
