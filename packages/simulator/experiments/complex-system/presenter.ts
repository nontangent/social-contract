import { IPresenter } from "@social-contract/presenters";
import { IContractPlayer } from "@social-contract/complex-system/player.interface";
import { IContractSimulator } from "@social-contract/complex-system/simulator.interface";

import { getLogger } from 'log4js';
import { ICommerceSystem, Result, Transaction } from "@social-contract/core/system";
import { PlayerId } from "@social-contract/core/player";
import { range, sleep, z2, z7 } from "@social-contract/utils/helpers";
import { SystemPresenter } from '@social-contract/presenters';
import { HistoryPresenter } from "@social-contract/presenters/history.presenter";
const logger = getLogger(__filename);


export class Presenter implements IPresenter {

  private systemPresenter = new SystemPresenter();
  historyPresenter = new HistoryPresenter();

  async render(simulator: IContractSimulator, transaction: Transaction): Promise<void> {
    // const { t, sellerId, buyerId, result } = transaction;
    // const n = simulator.n;
    const { t, n, recorderMap } = simulator; 
    let determinedT = t - 2 * n * (n - 1);
    determinedT = determinedT < 0 ? 0 : determinedT;

    const systems = simulator.players.reduce((p, player) => ({
      ...p, [`${player.id}`]: player.system
    }), {} as {[key: string]: ICommerceSystem});
    const systemTable = this.systemPresenter.buildSystemString(systems, recorderMap, determinedT, n);
    const historyTable = this.historyPresenter.buildHistoryString(systems, t, {maxSize: 16, padding: -10});

    console.clear();
    logger.info('==============================================================');
    logger.info(`At the time(${z7(transaction.t)}), seller(${z2(transaction.sellerId)}) and buyer(${z2(transaction.buyerId)}) deal. The result is ${transaction.result}`);
    logger.info(`\n`);
    logger.info(`=== History === `);
    logger.info(historyTable);
    logger.info(`\n`);
    logger.info(`=== Balances === `);
    logger.info(systemTable);
    logger.info('==============================================================');

    // Object.values(systems).

    // 待機する
    await sleep(20);
  }
}