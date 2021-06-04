import { MySQLRepository } from '@social-contract/instruments/repositories';
import { ISimulatorLogger } from './base.interfaces';

export abstract class BaseSimulatorLogger<ISimulator> implements ISimulatorLogger<ISimulator> {
  repository = new MySQLRepository('social_contract_development');

  async setup(): Promise<void> {
    return await this.repository.connect();
  }

  async close(): Promise<void> {
    return await this.repository.close();
  }

  abstract log(simulator: ISimulator): Promise<void>;
}
