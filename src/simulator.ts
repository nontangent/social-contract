import { BuyerStrategy, CommerceResult, SellerStrategy } from './models';
import { Player } from './player';

export class Simulator {
  t: number = 0;
  players: Player[];

  get n(): number {
    return this.players.length;
  }

  constructor(n: number) {
    this.players = [...Array(n)].map((_, i) => new Player(i));
  }

  run() {
    // sellerとbuyerの一周の順番を決める(n(n-1))必要あるわ。
    const combinations = this.generateCombinations(this.players);
    while (true) {
      for (const [sellerId, buyerId] of combinations) {
        const seller = this.players[sellerId];
        const buyer = this.players[buyerId];
        const escrows = this.players.filter(player => {
          return ![sellerId, buyerId].includes(player.id)
        });

        // sellerは商品である過去の履歴を渡す
        seller.sendReportedRecords(buyer, this.n);

        // buyerはエスクローに結果を報告する。
        buyer.reportResult(escrows);
      }
    }
  }

  // playersから商取引ゲームの順番を決める。
  generateCombinations(players: Player[]): [number, number][] {
    return [[0, 1]];
  }

  getResult(sellerStrategy: SellerStrategy, buyerStrategy: BuyerStrategy): CommerceResult {
    return CommerceResult.SUCCESS;
  }


}
