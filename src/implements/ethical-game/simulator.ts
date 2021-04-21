import { ISimulator } from '@social-contract/core/simulator';
import { ICommerceSystem } from '@social-contract/core/system';
import { permutation } from '@social-contract/core/helpers';
import { IPlayer, MessageType } from './player';

export class Simulator implements ISimulator<MessageType> {
  t = 0;

  constructor(
    public players: IPlayer[],
    public system: ICommerceSystem,
  ) { }

  run() {
    const maxT = 2;
    const combinations = this.generateCombinations();

    console.debug('combinations:', combinations);

    while (this.t < maxT * combinations.length) {
      for (const [sellerId, buyerId] of combinations) {
        console.debug('simulator.t:', this.t);

        this.t += 1;
        const seller = this.players.find(p => p.id === sellerId)!;
        const buyer = this.players.find(p => p.id === buyerId)!;
        this.deal(seller, buyer);

        const balances = this.system.getBalances(this.t);
        console.debug('balances:', balances);
      }
    }
  }

  deal(seller: IPlayer, buyer: IPlayer) {
    // 商取引ゲームの結果を取得
    const result = seller.sendGoods(buyer);

    // 商取引システムに結果を記録
    this.system.setTransaction({t: this.t, sellerId: seller.id, buyerId: buyer.id, result});
  }

  // playersから商取引ゲームの順番を決める。
  private generateCombinations(): [number, number][] {
    const playerIds = this.players.map(p => p.id);
    return permutation<number>(playerIds, 2) as [number, number][];
  }

  get n() {
    return this.players.length;
  }

}