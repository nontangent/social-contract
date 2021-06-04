import { ISimulation, ISystemResult } from '@social-contract/instruments/models';
import { IContractSimulator } from '@social-contract/instruments/simulators';
import { InitialState } from '@social-contract/libs/core';
import { BaseSimulatorLogger } from '../base';

export class ComplexSystemLogger extends BaseSimulatorLogger<IContractSimulator> {
  async log(simulator: IContractSimulator): Promise<void> {
    await this.saveSimulation(simulator);
    await this.saveSystemsResult(simulator);
  }

  async saveSimulation(simulator: IContractSimulator): Promise<void> {
    const data: ISimulation = {
      id: simulator.id,
      label: simulator.label,
      description: simulator.description,
      initialState: {} as InitialState,
      // initialState: simulator.system.store.getInitialState()!,
      playersInfo: simulator.playersInfo,
    };
    await this.repository.createSimulationRecord(data);
  }

  async saveSystemsResult(simulator: IContractSimulator): Promise<void> {
    const results: ISystemResult[] = [...simulator.recorderMap.entries()].map(([key, recorder]) => {
      const ownerId = typeof key === 'string' ? key : `${key.id}`;
      return {
        t: simulator.t,
        simulationId: simulator.id,
        ownerId: ownerId,
        reported: recorder.calcReportedSuccessRate(),
        true: recorder.calcTrueSuccessRate(),
      };
    });
    await this.repository.saveSystemResults(results);
  }
}
