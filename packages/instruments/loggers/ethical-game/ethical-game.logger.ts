import { ISimulation, ISystemResult } from '@social-contract/instruments/models';
import { IEthicalGameSimulator } from '@social-contract/instruments/simulators';
import { BaseSimulatorLogger } from '../base';

export class EthicalGameLogger extends BaseSimulatorLogger<IEthicalGameSimulator> {
  async log(simulator: IEthicalGameSimulator): Promise<void> {
    await this.saveSimulation(simulator);
    await this.saveSystemsResult(simulator);
  }

  async saveSimulation(simulator: IEthicalGameSimulator): Promise<void> {
    const data: ISimulation = {
      id: simulator.id,
      label: simulator.label,
      description: simulator.description,
      initialState: simulator.system.store.getInitialState()!,
      playersInfo: simulator.playersInfo,
    };
    await this.repository.createSimulationRecord(data);
  }

  async saveSystemsResult(simulator: IEthicalGameSimulator): Promise<void> {
    const results: ISystemResult[] = [...simulator.recorderMap.entries()].map(([key, recorder]) => {
      const ownerId = typeof key === 'string' ? key : `${key.id}`;
      return {
        t: simulator.t,
        simulationId: simulator.id,
        ownerId: ownerId,
        reported: recorder.calcReportedSuccessRate(),
        true: recorder.calcTrueSuccessRate(),
      }
    });
    await this.repository.saveSystemResults(results);
  }
}
