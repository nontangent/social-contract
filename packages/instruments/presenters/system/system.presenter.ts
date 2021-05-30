import { IPlayer } from '@social-contract/libs/core/player';
import { ICommerceSystem } from '@social-contract/libs/core/system';
import { f2, p100 } from '@social-contract/libs/utils/helpers';
import { SuccessRateRecorder } from '@social-contract/instruments/recorders';
import { BalancesData, BalancesPresenter, RecorderData, RecorderPresenter } from '@social-contract/instruments/presenters';

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
      const recorder = data.recorder.get(key)!;

      return table.addRow(
        this.getKeyString(key), 
        ...balances, 
        this.recorder.formatSuccessRate(recorder.reported), 
        this.recorder.formatSuccessRate(recorder.true)
      );
    })
    return table.toString();
  }

  getKeyString(key: MapKey): string {
    return typeof key === 'string' ? key : key.name;
  }
}

