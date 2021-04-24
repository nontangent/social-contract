import { IPresenter, PlayerId } from '@social-contract/core/index';
import { permutation } from '@social-contract/core/helpers';
import { IContractPlayer } from './player.interface';
import { IContractSimulator } from './simulator.interface';

import { getLogger } from 'log4js';
const logger = getLogger('@social-contract/implements/scp/simulator');

export class Simulator implements IContractSimulator {
  t: number = 0;

  constructor(
    public players: IContractPlayer[] = [],
    public presenter: IPresenter,
  ) { }

  async run(maxT: number = 10) {
    // sellerとbuyerの一周の順番を決める(n * (n-1))。
    const combinations = this.generateCombinations();

    while (this.t < combinations.length * maxT) {
      for (const [sellerId, buyerId] of combinations) {
        logger.debug('Flag 1');

        // 時刻を進める
        this.t += 1;
        for (const player of this.players) player.t = this.t;

        logger.debug('Flag 2');

        // seller,buyer,escrowsを取得
        const seller = this.getPlayer(sellerId);
        const buyer = this.getPlayer(buyerId);
        // const escrows = this.players.filter(player => ![sellerId, buyerId].includes(player.id));
        const escrows = this.players;

        logger.debug('Flag 3');

        // sellerは商品である過去の履歴を渡す
        seller.sendGoods(buyer);

        logger.debug('Flag 4');

        // buyerはエスクローに結果を報告する
        buyer.reportResult(seller, escrows);
        logger.debug('Flag 5');

        // 
        this.presenter.render(this);
        logger.debug('Flag 6');

      }
    }
  }

  async sleep(seconds: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
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