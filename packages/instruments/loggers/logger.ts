import { PlayerId } from '@social-contract/libs/core';
import { ISimulator } from '@social-contract/instruments/simulators';
import { ISimulation, ISystemResult } from '@social-contract/instruments/models';
import { MySQLRepository } from '@social-contract/instruments/repositories';
import { Store } from '@social-contract/libs/ethical-game';

export interface ISimulatorLogger<IPlayer> {
  close(): Promise<void>;
  setup(): Promise<void>;
  saveSimulatorData(simulator: ISimulator<IPlayer>): Promise<void>;
  saveSystemsResult(simulator: ISimulator<IPlayer>): Promise<void>;
}

export class BaseSimulatorLogger<IPlayer extends { id: PlayerId }> implements ISimulatorLogger<IPlayer> {
  repository = new MySQLRepository('social_contract_development');

  async setup(): Promise<void> {
    return await this.repository.connect();
  }

  async close(): Promise<void> {
    return await this.repository.close();
  }

  async saveSimulatorData(simulator: ISimulator<IPlayer> & {system: {store: Store<any>}}): Promise<void> {
    const data: ISimulation = {
      id: simulator.id,
      label: simulator.label,
      description: simulator.description,
      initialState: simulator.system.store.getInitialState()!,
      playersInfo: simulator.playersInfo,
    };
    await this.repository.createSimulationRecord(data);
  }

  async saveSystemsResult(simulator: ISimulator<IPlayer>): Promise<void> {
    const records: ISystemResult[] = [...simulator.recorderMap.entries()].map(([key, recorder]) => {
      const ownerId = typeof key === 'string' ? key : `${key.id}`;
      return {
        t: simulator.t,
        simulationId: simulator.id,
        ownerId: ownerId,
        reported: recorder.calcReportedSuccessRate(),
        true: recorder.calcTrueSuccessRate(),
      }
    });
    await this.repository.saveSystemResults(records);
  }
}
