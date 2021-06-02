import { p100 } from '@social-contract/libs/utils/helpers';
import { MapKey, RecorderMap } from '@social-contract/instruments/simulators/interfaces';
import { IPlayer } from '@social-contract/libs/core';

const AsciiTable = require('ascii-table');

export type RecorderData = Map<MapKey<IPlayer<any>>, { true: number | null, reported: number | null }>;

export class RecorderPresenter {
  buildRecorderString(recorderMap: RecorderMap<IPlayer<any>>): string {
    const data = this.buildRecorderData(recorderMap);
    return this.formatRecorderData(data);
  }

  buildRecorderData(recorderMap: RecorderMap<IPlayer<any>>): RecorderData {
    return [...recorderMap.entries()].reduce((pre, [key, recorder]) => pre.set(key, {
      true: recorder.calcTrueSuccessRate(),
      reported: recorder.calcReportedSuccessRate(),
    }), new Map() as RecorderData);
  }

  formatRecorderData(data: RecorderData): string {
    const table = new AsciiTable();
    table.setHeading(`SuccessRate`, 'True', 'Reported');
    for (const [key, value] of data.entries()) {
      table.addRow(key, this.formatSuccessRate(value.true), this.formatSuccessRate(value.reported));
    }
    return table.toString();
  }

  formatSuccessRate(rate: number | null): string {
    return rate !== null ? `${p100(rate)}` : `-`;
  }
}
