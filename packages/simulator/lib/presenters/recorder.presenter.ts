import { Result } from '@social-contract/core/system';
import { b3, p100, sum } from '@social-contract/utils/helpers';
import { SuccessRateRecorder } from '@social-contract/core/recorder';
const AsciiTable = require('ascii-table');

export interface RecorderData {
  [key: string]: { true: number, reported: number };
}

export class RecorderPresenter {
  buildRecorderString(recorderMap: {[key: string]: SuccessRateRecorder}): string {
    const data = this.buildRecorderData(recorderMap);
    return this.formatRecorderData(data);
  }

  buildRecorderData(recorderMap: {[key: string]: SuccessRateRecorder}): RecorderData {
    return Object.entries(recorderMap).reduce((pre, [key, recorder]) => ({
      ...pre,
      [key]: {
        true: this.calcTrueSuccessRate(recorder),
        reported: this.calcReportedSuccessRate(recorder)
      }
    }), {} as RecorderData);
  }

  formatRecorderData(data: RecorderData): string {
    const table = new AsciiTable();
    table.setHeading(`SuccessRate`, 'True', 'Reported');
    for (const [key, value] of Object.entries(data)) {
      table.addRow(key, `${p100(value.true)}`, `${p100(value.reported)}`);
    }
    return table.toString();
  }

  calcTrueSuccessRate(recorder: SuccessRateRecorder): number {
    const results = recorder.trueResults.readAll();
    return this.calcSuccessRate(results);
  }

  calcReportedSuccessRate(recorder: SuccessRateRecorder): number {
    const results = recorder.reportedResults.readAll();
    return this.calcSuccessRate(results);
  }

  private calcSuccessRate(results: Result[]): number {
    return sum(results.map(r => r === Result.SUCCESS ? 1 : 0)) / results.length;
  }
}
