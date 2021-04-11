import { IPlayer, MessageType } from '../player';
import { IPresenter } from '../presenter';
import { ISimulator } from './simulator.interface';
import { permutation } from '../helpers';

export class Simulator implements ISimulator<any> {
  t: number = 0;

  get n(): number {
    return this.players.length;
  }

  constructor(
    public players: IPlayer<MessageType>[] = [],
    public presenter: IPresenter,
  ) { }

  async run(maxCount: number = 10) {
    // sellerとbuyerの一周の順番を決める(n(n-1))必要あるわ。
    let count = 0;
    const combinations = this.generateCombinations();
    while (count < maxCount) {
      for (const [sellerId, buyerId] of combinations) {
        // console.debug(`${this.t}: transaction[seller(${sellerId}), buyer(${buyerId})]`);

        this.presenter.render(this);

        const seller = this.players[sellerId];
        const buyer = this.players[buyerId];
        const escrows = this.players.filter(player => ![sellerId, buyerId].includes(player.id));

        // sellerは商品である過去の履歴を渡す
        seller.sendGoods(buyer);

        // buyerはエスクローに結果を報告する。
        buyer.reportResult(seller, escrows);
        this.t += 1;
        await this.sleep(0.01);
      }

      count += 1;
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

}