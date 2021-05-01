import { PlayerId } from '@social-contract/core/player';
import { Balances, ICommerceSystem, InitialState, IStore, Result, Rewards, Transaction } from "@social-contract/core/system";
import { Store } from '@social-contract/ethical-game/store';
import { isSetsEqual, sum } from '@social-contract/utils/helpers';
import { getLogger } from 'log4js';
const logger = getLogger('@social-contract/ethical-game/system');

export type EscrowWeights = Record<PlayerId, number>;

export abstract class BaseCommerceSystem implements ICommerceSystem {
  public price = 1;
  store: IStore = new Store();

  constructor(initialState: InitialState) {
    this.store.setInitialState(initialState)
  }

  getRewards(balances: Balances, sellerId: PlayerId, buyerId: PlayerId): Rewards {
    // エスクローコスト(失敗が報告された場合に没収される合計金額)を決定する
    const E = this.getEscrowCost(balances, sellerId, buyerId);
    logger.debug(`EscrowCost: ${E}`);

    // エスクローコストの負担割合を決定する
    const [sellerW, buyerW] = this.getNormalizedBurdenWeights(balances, sellerId, buyerId);
    logger.debug(`sellerW: ${sellerW}, buyerW: ${buyerW}`);

    // 成功が報告された場合と失敗が報告された場合のsellerとbuyerのbalancesの変動値を決定する
    return {
      seller: {
        success: this.price,
        failure: this.price - (sellerW * E * this.price),
      },
      buyer: {
        success: -1 * this.price,
        failure: this.price - (buyerW * E * this.price),
      }
    }
  }

  getTransaction(t: number): Transaction | null {
    return this.store.getTransaction(t);
  }

  setTransaction(transaction: Transaction) {
    return this.store.setTransaction(transaction);
  }

  getBalances(t: number): Balances {

    // 時刻が0の場合は初期状態のbalancesを返す
    if (t === 0) return this.store.getInitialState()!.balances;

    // 時刻t-1のbalancesを取得する
    const balances = this.getBalances(t-1);
    
    // 時刻tの商取引を取得する
    const transaction = this.getTransaction(t);
    if (!transaction) throw new Error(`A transaction at time(${t}) is none.`);

    const {sellerId, buyerId, result} = transaction;

    // 商取引ゲームに伴うbalancesの変動の幅を取得する
    const rewards = this.getRewards(balances, sellerId, buyerId);
    logger.debug('rewards:', rewards);

    // 失敗が報告された場合にsellerかbuyerのどちらかの残高が0以下になるならば、balancesを変動させずに返す
    if (
      balances[sellerId] + rewards.seller.success < 0 ||
      balances[sellerId] + rewards.seller.failure < 0 || 
      balances[buyerId] + rewards.buyer.success < 0 ||
      balances[buyerId] + rewards.buyer.failure < 0
    ) return balances;

    // 報告された結果に基づいてbalancesを変動させる
    balances[sellerId] += result === Result.SUCCESS ? rewards.seller.success : rewards.seller.failure;
    balances[buyerId] += result === Result.SUCCESS ? rewards.buyer.success : rewards.buyer.failure;
    logger.debug('result:', result);

    // 現在のbalancesの総量を取得する
    const currentAmount = Math.round(this.getTotalAmount(balances));
    logger.debug('currentAmount:', currentAmount);

    // 初期のbalancesの総量を取得する
    const initialAmount = Math.round(this.getTotalAmount(this.store.getInitialState()!.balances));
    logger.debug('initialAmount:', initialAmount);

    // 初期と現在のbalancesの総量の差を計算する
    const delta = initialAmount - currentAmount;
    logger.debug('delta:', delta);

    // 差分を各プレイヤーに分配する際に用いる重みを取得する
    const escrowWeights = this.getEscrowWeights(balances, []);
    logger.debug('escrowWeights:', escrowWeights);

    // 差分を各プレイヤーに分配する
    Object.entries(escrowWeights).forEach(([id, w]) => {
      balances[parseInt(id, 10)] += delta * w;
    });
    return balances
  }

  getBalance(playerId: PlayerId, t: number): number {
    return this.getBalances(t)[playerId];
  }

  get n(): number {
    return Object.keys(this.store.getInitialState()!.balances).length;
  }

  getPlayerIds(excludeIds: PlayerId[] = []): PlayerId[] {
    return Object.keys(this.store.getInitialState()!.balances)
      .map(id => parseInt(id, 10))
      .filter(id => !excludeIds.includes(id));
  }

  getTotalAmount(balances: Balances, excludeIds: PlayerId[] = []): number {
    const playerIds = this.getPlayerIds(excludeIds);
    return sum(playerIds.map(id => balances[id]));
  }

  abstract getNormalizedBurdenWeights(balances: Balances, sellerId: PlayerId, buyerId: PlayerId): [number, number];
  abstract getEscrowCost(balances: Balances, sellerId: PlayerId, buyerId: PlayerId): number;
  abstract getEscrowWeights(balances: Balances, excludeIds: PlayerId[]): EscrowWeights;
}

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

export class MemoCommerceSystem extends CommerceSystem {
  balancesCache = new Map<number, Balances>();
  balanceCache: {[key: number]: {[key: number]: number}} = {};

  getBalances(t: number): Balances {
    const cached = this.balancesCache.get(t);
    // if (cached) { console.warn(t, 'is cached!') } else { console.warn(t, 'is new!') };
    if (cached) return {...cached};

    const balances = super.getBalances(t);
    this.balancesCache.set(t, {...balances});
    return {...balances};
  }

  // getBalance(playerId: number, t: number) {
  //   return this.getBalances(t)[playerId];
    // this.balanceCache = this.balanceCache || {};
    // this.balanceCache[playerId] = this.balanceCache?.[playerId] || {};
    // if (this.balanceCache[playerId][t]) return this.balanceCache[playerId][t];
    // const balance = super.getBalance(playerId, t);
    // this.balanceCache[playerId][t] = balance;
    // return balance;
  // }
}

export class CompareSystem implements ICommerceSystem {
  constructor(private systems: ICommerceSystem[] = []) { }

  get n(): number {
    return this.compare<number>(system => system.n);
  }

  get store(): IStore {
    return this.compare<IStore>(system => system.store);
  }

  private compare<T = any>(func: (system: ICommerceSystem) => T) {
    let same!: T;
    this.systems.map(func).forEach((res: T) => {
      if (!same || JSON.stringify(same) === JSON.stringify(res)) {
        same = res;
      } else {
        console.error('A:', same);
        console.error('B:', res);
        throw new Error('Compared Systems does not return as same');
      }
    });
    return same;
  }

  getPlayerIds(excludes?: PlayerId[]): PlayerId[] {
    return this.compare(system => system.getPlayerIds(excludes));
  }

  getBalances(t: number): Balances {
    return this.compare(system => system.getBalances(t));
  }

  getBalance(playerId: number, t: number): number {
    return this.compare(system => system.getBalance(playerId, t));
  }

  getTransaction(t: number): Transaction | null {
    return this.compare(system => system.getTransaction(t));
  }
  
  setTransaction(transaction: Transaction): void {
    return this.compare(system => system.setTransaction(transaction));
  }

}