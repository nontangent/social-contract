import { Player } from './player';
import { CommerceSystem, Transaction, Result } from '../system';

describe('Player Class Test', () => {
  const systemFactory = () =>  new CommerceSystem({balances: {}});

  it('Initialize Player', () => {
    const player = new Player(0, systemFactory());
  });

  it('sendGoods()', () => {
    const seller = new Player(0, systemFactory());
    const buyer = new Player(1, systemFactory());
    const records: Transaction[] = [...Array(100)].map((_, i) => ({
      t: i,
      sellerId: 0,
      buyerId: 1,
      reporterId: 2,
      result: Result.SUCCESS
    }));

    const res = seller.sendGoods(buyer);
  });

  it('reportResult()', () => {
    const seller = new Player(0, systemFactory());
    const buyer = new Player(1, systemFactory());
    const escrow = new Player(2, systemFactory());
    const res = buyer.reportResult(seller, [escrow]);
  });
});