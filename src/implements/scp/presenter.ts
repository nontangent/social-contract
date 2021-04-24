import { IPresenter } from "@social-contract/core/presenter";
import { IContractPlayer } from "./player.interface";
import { IContractSimulator } from "./simulator.interface";

import { getLogger } from 'log4js';
const logger = getLogger('@social-contract/implements/scp/presenter');

const AsciiTable = require('ascii-table');

export class Presenter implements IPresenter {

  render(simulator: IContractSimulator) {
    const table = this.buildTable(simulator);
    // console.clear();
    console.log(table.toString());
    const player = simulator.players.find(player => player.id === 0)!;
    const n = simulator.n;
    const transaction = player.system.getTransaction(simulator.t - n * (n - 1) - 1);
    logger.debug('transaction:', transaction);
  }

  buildTable(simulator: IContractSimulator) {
    const table = new AsciiTable();
    table.setHeading(...this.buildHeading(simulator));
    for (const player of simulator.players) {
      table.addRow(...this.buildRow(player, simulator.n, simulator.t));
    }
    return table
  }

  buildHeading(simulator: IContractSimulator) {
    return [`${simulator.t}`, ...[...Array(simulator.n)].map((_, i) => `${i}`)];
  }

  buildRow(player: IContractPlayer, n: number, t: number) {
    if (t - n * (n - 1) < 0) return [`${player.id}`, ...[...Array(n)].map(() => '')];
    const balances = player.system.getBalances(t - n * (n - 1));
    // console.debug(balances);
    const arr = [...Array(n)].map((_, i) => balances[i]);
    return [`${player.id}`, ...arr];
  }
}

export class NoopPresenter implements IPresenter {
  render() { }
}