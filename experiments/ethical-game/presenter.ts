import { Transaction } from '@social-contract/core/system';
import { IEthicalGameSimulator } from '@social-contract/ethical-game/simulator.interface';
import { IPresenter, SystemPresenter, HistoryPresenter, TransactionPresenter } from '@social-contract/presenters';

import { getLogger } from 'log4js';
const logger = getLogger('@social-contract/implements/ethical-game/presenter');

export class EthicalGamePresenter implements IPresenter {
  systemPresenter = new SystemPresenter();
  transactionPresenter = new TransactionPresenter();
  historyPresenter = new HistoryPresenter();
  // successRatePresenter = new SuccessRatePresenter();

  async render(simulator: IEthicalGameSimulator, transaction: Transaction): Promise<void> {
    const { t, n, system, recorderMap } = simulator;
    const systemMap = { system };
    const transactionStr = this.transactionPresenter.buildStr(transaction);

    const balanceTable = this.systemPresenter.buildSystemString(systemMap, recorderMap, t, n);
    const historyTable = this.historyPresenter.buildHistoryString(systemMap, t, {maxSize: 16, padding: 2});
    // const successRateTable = this.successRatePresenter.buildSuccessRateString(recorderMap);

    console.clear();
    logger.info(transactionStr);
    logger.info(historyTable);
    logger.info(balanceTable);
    // logger.info(successRateTable);
  }

}
