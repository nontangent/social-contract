import { IPlayer } from '@social-contract/core/player';
import { SuccessRateRecorder } from '@social-contract/core/recorder';
import { ICommerceSystem } from '@social-contract/core/system';
import { f2, p100 } from '@social-contract/utils/helpers';
import { BalancesData, BalancesPresenter } from './balances.presenter';
import { RecorderData, RecorderPresenter } from './recorder.presenter';
const AsciiTable = require('ascii-table');

type MapKey = IPlayer<any> | string;

export interface SystemData {
  balances: BalancesData;
  recorder: RecorderData;
}

export class SystemPresenter {
  balances = new BalancesPresenter();
  recorder = new RecorderPresenter();

  buildSystemString(    
    systemMap: Map<MapKey, ICommerceSystem>, 
    recorderMap: Map<MapKey, SuccessRateRecorder>,
    t: number, 
    n: number
  ): string {
    const data = this.buildSystemData(systemMap, recorderMap, t, n);
    return this.formatSystemData(data);
  }

  buildSystemData(
    systemMap: Map<MapKey, ICommerceSystem>, 
    recorderMap: Map<MapKey, SuccessRateRecorder>,
    t: number, 
    n: number
  ): SystemData {
    return {
      balances: this.balances.buildBalancesData(systemMap, t, n),
      recorder: this.recorder.buildRecorderData(recorderMap),
    }
  }

  formatSystemData(data: SystemData): string {
    const table = new AsciiTable();
    table.setHeading(
      `System Owner \\ Player`, 
      ...[...Array(data.balances.n)].map((_, i) => `${i}`),
      'Reported', 'True'
    );
    [...data.balances.balances.keys()].forEach(key => {
      const balances = data.balances.balances.get(key)!.map(b => f2(b));
      const recorder = data.recorder.get(key);
      const formatter = (n: number | undefined): string => n ? `${p100(n)}` : `-`;
      return table.addRow(this.getKeyString(key), ...balances, formatter(recorder?.reported), formatter(recorder?.true));
    })
    return table.toString();
  }

  getKeyString(key: MapKey): string {
    return typeof key === 'string' ? key : key.name;
  }
}

