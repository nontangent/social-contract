import { Result } from '@social-contract/core/system';
import { b3, p100, sum } from '@social-contract/utils/helpers';
import { SuccessRateRecorder } from '@social-contract/core/recorder';
import { IPlayer } from '@social-contract/core/player';
const AsciiTable = require('ascii-table');

// export interface RecorderData {
//   [key: string]: { true: number, reported: number };
// }

type MapKey = IPlayer<any> | string;

export type RecorderData = Map<MapKey, { true: number | null, reported: number | null }>;
export type RecorderMap = Map<MapKey, SuccessRateRecorder>;

export class RecorderPresenter {
  buildRecorderString(recorderMap: RecorderMap): string {
    const data = this.buildRecorderData(recorderMap);
    return this.formatRecorderData(data);
  }

  buildRecorderData(recorderMap: RecorderMap): RecorderData {
    return [...recorderMap.entries()].reduce((pre, [key, recorder]) => pre.set(key, {
      true: this.calcTrueSuccessRate(recorder),
      reported: this.calcReportedSuccessRate(recorder)
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

  calcTrueSuccessRate(recorder: SuccessRateRecorder): number | null {
    const results = recorder.trueResults.readAll();
    if (results.length !== recorder.trueResults.maxSize) return null;
    return this.calcSuccessRate(results);
  }

  calcReportedSuccessRate(recorder: SuccessRateRecorder): number | null {
    const results = recorder.reportedResults.readAll();
    if (results.length !== recorder.reportedResults.maxSize) return null;
    return this.calcSuccessRate(results);
  }

  private calcSuccessRate(results: Result[]): number {
    return sum(results.map(r => r === Result.SUCCESS ? 1 : 0)) / results.length;
  }
}
