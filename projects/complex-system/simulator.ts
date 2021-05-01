import { sleep } from '@social-contract/utils/helpers';
import { IPresenter } from '@social-contract/presenters';
import { BaseSimulator } from '@social-contract/core/simulator';

import { IContractPlayer } from './player.interface';
import { IContractSimulator } from './simulator.interface';

import { getLogger } from 'log4js';
import { Result } from '@social-contract/core/system';
const logger = getLogger(__filename);

export class Simulator extends BaseSimulator<IContractPlayer> implements IContractSimulator {
  recorderMap = {};

  constructor(
    public players: IContractPlayer[] = [],
    public presenter: IPresenter,
  ) {
    super();
  }

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

        // 
        await sleep(interval);
      }
    }
  }

  getTrueResult(): Result {
    return Result.SUCCESS;
  }

}