import { CommerceRecord, CommerceResult } from './models';
import { Player } from './player';

describe('Player Class Test', () => {
  it('Initialize Player', () => {
    const player = new Player(0);
  });

  it('sendGoods()', () => {
    const seller = new Player(0);
    const buyer = new Player(1);
    const records: CommerceRecord[] = [...Array(100)].map((_, i) => ({
      t: i,
      sellerId: 0,
      buyerId: 1,
      reporterId: 2,
      result: CommerceResult.SUCCESS
    }));

    const res = seller.sendGoods(buyer);
  });

  it('reportResult()', () => {
    const seller = new Player(0);
    const buyer = new Player(1);
    const escrow = new Player(2);
    const res = buyer.reportResult(seller, [escrow]);
  });
});