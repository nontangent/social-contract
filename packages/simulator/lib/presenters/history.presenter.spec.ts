import { PlayerId } from "@social-contract/core/player";
import { Balances, ICommerceSystem, InitialState, IStore, Result, Rewards, Transaction } from "@social-contract/core/system";
import { Store } from "../store";
import { HistoryPresenter } from "./history.presenter";

export class TestCommerceSystem implements ICommerceSystem {
  public price = 1;
  n = 0;
  store: IStore = new Store();

  constructor(initialState: InitialState) {
    this.store.setInitialState(initialState)
  }

  getPlayerIds() {
    return [];
  }

  getRewards(balances: Balances, sellerId: PlayerId, buyerId: PlayerId): Rewards {
    return {} as Rewards;
  }

  getTransaction(t: number): Transaction | null {
    return this.store.getTransaction(t);
  }

  setTransaction(transaction: Transaction) {
    return this.store.setTransaction(transaction);
  }

  getBalances(t: number): Balances {
    return {} as Balances
  }

  getBalance() {
    return 0;
  }
}

describe('History Presenter Test', () => {
  let presenter: HistoryPresenter = new HistoryPresenter();

  it('', () => {
    const results = ['S', 'S', 'S', 'S', 'S', 'S'];
    const initialState = {balances: {}};
    const system = new TestCommerceSystem(initialState);

    results.forEach((result, i) => {
      system.setTransaction({
        t: i + 1,
        sellerId: 0,
        buyerId: 0,
        result: result === 'S' ? Result.SUCCESS : Result.FAILED,
      });
    });

    const data = presenter.buildHistoryData({'TestSystem': system}, 4, {maxSize: 4, padding: 0});
    expect(data.historyMap['TestSystem']).toEqual(['S', 'S', 'S', 'S']);
  });

  it(`expected: ['S', ' ', ' ', ' ']`, () => {
    const results = ['S'];
    const initialState = {balances: {}};
    const system = new TestCommerceSystem(initialState);

    results.forEach((result, i) => {
      system.setTransaction({
        t: i + 1,
        sellerId: 0,
        buyerId: 0,
        result: result === 'S' ? Result.SUCCESS : Result.FAILED,
      });
    });

    const data = presenter.buildHistoryData({'TestSystem': system}, 4, {maxSize: 4, padding: 0});
    expect(data.historyMap['TestSystem']).toEqual(['S', ' ', ' ', ' ']);
  });

  it(`expected: ['S', 'S', 'S', 'F']`, () => {
    const results = ['S', 'S', 'S', 'S', 'S', 'F'];
    const initialState = {balances: {}};
    const system = new TestCommerceSystem(initialState);

    results.forEach((result, i) => {
      system.setTransaction({
        t: i + 1,
        sellerId: 0,
        buyerId: 0,
        result: result === 'S' ? Result.SUCCESS : Result.FAILED,
      });
    });

    const data = presenter.buildHistoryData({'TestSystem': system}, 6, {maxSize: 4, padding: 0});
    expect(data.historyMap['TestSystem']).toEqual(['S', 'S', 'S', 'F']);
  });
});