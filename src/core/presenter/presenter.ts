import { IPlayer, SystemOwner } from '../player';
import { ISimulator } from "../simulator";
import { IPresenter } from './presenter.interface';

const AsciiTable = require('ascii-table');

type Player = IPlayer<any> & SystemOwner;

export class Presenter implements IPresenter {

  render(simulator: ISimulator<any>) {
    const table = this.buildTable(simulator);
    console.clear();
    console.log(table.toString());
  }

  buildTable(simulator: ISimulator<any>) {
    const table = new AsciiTable();
    table.setHeading(...this.buildHeading(simulator));
    for (const player of simulator.players) {
      table.addRow(...this.buildRow(player as Player, simulator.n, simulator.t));
    }
    return table
  }

  buildHeading(simulator: ISimulator<any>) {
    return [`${simulator.t}`, ...[...Array(simulator.n)].map((_, i) => `${i}`)];
  }

  buildRow(player: Player, n: number, t: number) {
    const balances = player.system.getBalances(t);
    const arr = [...Array(n)].map((_, i) => balances[i]);
    return [`${player.id}`, ...arr];
  }
}

export class NoopPresenter implements IPresenter {
  render() { }
}