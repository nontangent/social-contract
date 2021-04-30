import { IPresenter } from "@social-contract/core/presenter";
import { IContractPlayer } from "./player.interface";
import { IContractSimulator } from "./simulator.interface";

import { getLogger } from 'log4js';
import { Result, Transaction } from "@social-contract/core/system";
import { PlayerId } from "@social-contract/core/player";
import { sleep, z2, z7 } from "@social-contract/core/helpers";
const logger = getLogger('@social-contract/implements/scp/presenter');

const AsciiTable = require('ascii-table');

export class Presenter implements IPresenter {

  private tableBuilder = new TableBuilder();

  async render(simulator: IContractSimulator, transaction: Transaction): Promise<void> {
    const { t, sellerId, buyerId, result } = transaction;
    const n = simulator.n;
    let determinedT = t - 2 * n * (n - 1);
    determinedT = determinedT < 0 ? 0 : determinedT;

    // for (const player of simulator.players) {
    //   const history = player.system.history;
    //   const results = Object.keys(history).sort().map((k: string) => history[parseInt(k, 10)].result);
    //   logger.info(`player(${player.id}).system.history: ${results.map(r => r === Result.SUCCESS ? 'S' : 'F').join(', ')}`);
    // }

    const systems: SystemData = simulator.players.reduce((pre, player) => ({
      // ...pre, [player.id]: simulator.players.map(opp => player.system.getBalance(opp.id, determinedT)),
      ...pre, 
      [player.id]: simulator.players.map(opp => player.system.getBalances(determinedT)[opp.id]),
    }), {} as SystemData);
    const data: Data = { n: simulator.n, t: simulator.t, determinedT, systems };

    const player0 = this.getPlayer(simulator, 0)!;
    const player1 = this.getPlayer(simulator, 1)!;
    const player2 = this.getPlayer(simulator, 2)!;

    // if ([13].includes(t)) {
    //   console.debug('player(0).system.history:', player0.system.history);
    //   console.debug('player(1).system.history:', player1.system.history);
    //   console.debug('player(2).system.history:', player2.system.history);
    //   console.debug('balances:', player2.system.getBalances(1));
    // }
    // if (t == 14) process.exit();

    const tableStr = this.tableBuilder.buildString(data);

    console.clear();
    logger.info(`${z7(transaction.t)} (seller, buyer) = (${z2(transaction.sellerId)}, ${z2(transaction.buyerId)}) ${transaction.result}`);
    logger.info(tableStr);
    logger.info('==============================================================');
    await sleep(20);
  }

  getPlayer(simulator: IContractSimulator, playerId: PlayerId): IContractPlayer | undefined {
    return simulator.players.find(player => player.id === playerId);
  }
}

export class NoopPresenter implements IPresenter {
  async render() { }
}

export class TableBuilder {
  buildString(data: Data) {
    const table = new AsciiTable();
    table.setHeading(`${data.determinedT}`, ...[...Array(data.n)].map((_, i) => `${i}`));
    for (const playerId of Object.keys(data.systems)) {
      table.addRow(playerId, ...data.systems[playerId]);
    }
    return table.toString()
  }
}

interface Data {
  t: number;
  determinedT: number;
  n: number;
  systems: SystemData;
}

interface SystemData {[playerId: string]: number[]};