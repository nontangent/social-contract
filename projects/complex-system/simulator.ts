import { PlayerId } from '@social-contract/core/player';
import { permutation, sleep } from '@social-contract/utils/helpers';
import { IPresenter } from '@social-contract/presenters';

import { IContractPlayer } from './player.interface';
import { IContractSimulator } from './simulator.interface';

import { getLogger } from 'log4js';
const logger = getLogger(__filename);

export class Simulator implements IContractSimulator {
  t: number = 0;

  constructor(
    public players: IContractPlayer[] = [],
    public presenter: IPresenter,
  ) { }

  async run(maxT: number = 10, interval: number = 10) {
    // sellerとbuyerの一周の順番を決める(n * (n-1))。
    const combinations = this.generateCombinations();
    logger.info('combinations:', combinations);

    while (this.t < combinations.length * maxT) {
      for (const [sellerId, buyerId] of combinations) {
        // 時刻を進める
        this.t += 1;
        for (const player of this.players) player.t = this.t;

        // seller,buyer,escrowsを取得
        const seller = this.getPlayer(sellerId);
        const buyer = this.getPlayer(buyerId);
        // const escrows = this.players.filter(player => ![sellerId, buyerId].includes(player.id));
        const escrows = this.players;

        // sellerは商品である過去の履歴を渡す
        seller.sendGoods(buyer);

        // buyerはエスクローに結果を報告する
        const result = buyer.reportResult(seller, escrows);

        // Presenterで描画する
        await this.presenter.render(this, {t: this.t, sellerId, buyerId, result});

        await sleep(interval);
      }
    }
  }

  // playersから商取引ゲームの順番を決める。
  private generateCombinations(): [number, number][] {
    const playerIds = this.players.map(p => p.id);
    return permutation<number>(playerIds, 2) as [number, number][];
  }

  getPlayer(id: PlayerId): IContractPlayer {
    return this.players[id];
  }

  get n(): number {
    return this.players.length;
  }

}