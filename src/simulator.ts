import { BuyerStrategy, CommerceResult, SellerStrategy } from './models';
import { Player } from './player';
import { permutation } from './helpers';
import { CommerceSystem } from './system';

export class Simulator {
  t: number = 0;
  players: Player[];

  get n(): number {
    return this.players.length;
  }

  constructor(n: number) {
    this.players = [...Array(n)].map((_, i) => {
      const system = new CommerceSystem({balances: {}});
      return new Player(i, system);
    });
  }

  run(maxCount: number = 10) {
    // sellerとbuyerの一周の順番を決める(n(n-1))必要あるわ。
    let count = 0;
    const combinations = this.generateCombinations();
    while (count < maxCount) {
      for (const [sellerId, buyerId] of combinations) {
        const seller = this.players[sellerId];
        const buyer = this.players[buyerId];
        const escrows = this.players.filter(player => {
          return ![sellerId, buyerId].includes(player.id)
        });

        // sellerは商品である過去の履歴を渡す
        seller.sendGoods(buyer);

        // buyerはエスクローに結果を報告する。
        buyer.reportResult(seller, escrows);
      }

      count += 1;
    }
  }

  // playersから商取引ゲームの順番を決める。
  generateCombinations(): [number, number][] {
    const playerIds = this.players.map(p => p.id);
    return permutation<number>(playerIds, 2) as [number, number][];
  }

  getResult(sellerStrategy: SellerStrategy, buyerStrategy: BuyerStrategy): CommerceResult {
    return CommerceResult.SUCCESS;
  }

}