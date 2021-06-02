import { Connection, createConnection } from 'typeorm';
import { ISimulation, ISystemResult } from '@social-contract/instruments/models';

import { Simulation, SystemResult } from './entities';

export class MySQLRepository {

  private connection: Connection | null = null;

  constructor(private databaseName: string) { }

  async connect() {
    this.connection = await createConnection({
      type: 'mysql',
      host: 'localhost',
      port: 3308,
      username: 'root',
      password: 'example',
      database: this.databaseName,
      entities: [Simulation, SystemResult],
      synchronize: true,
      logging: false,
      charset: 'utf8mb4',
    });
  }
  
  async createSimulationRecord(simulation: ISimulation): Promise<void> {
    const data = new Simulation(simulation);
    await this.connection!.manager.save(data);
  }

  async saveSystemResults(results: ISystemResult[]): Promise<void> {
    for (let result of results) {
      await this.saveSystemResult(result);
    }
  }

  async saveSystemResult(result: ISystemResult): Promise<void> {
    const simulation = await this.connection?.getRepository(Simulation).findOne({id: result.simulationId});
    if (!simulation) throw new Error('Simulation not found!');

    const data = new SystemResult(result);
    data.simulation = simulation;
    await this.connection!.manager.save(data);
  }

  async getSimulationsByLabel(label: string): Promise<ISimulation[]> {
    const repository = this.connection!.getRepository(Simulation);
    const entities = await repository.find({relations: ['results'], where: { label }});
    return entities?.map(entity => this.convertEntityToSimulation(entity));
  }

  convertEntityToSimulation(entity: Simulation): ISimulation {
    return {
      id: entity.id,
      label: entity.label,
      initialState: JSON.parse(entity.initialState),
      description: entity.description,
      playersInfo: JSON.parse(entity.playersInfo),
      results: entity.results?.map(result => this.convertEntityToSystemResult(result)) || [],
    }
  } 

  convertEntityToSystemResult(entity: SystemResult): ISystemResult {
    return {
      t: entity.t,
      simulationId: entity.simulationId,
      ownerId: entity.ownerId,
      reported: entity.reported,
      true: entity.true,
    }
  }

  async close(): Promise<void> {
    await this.connection?.close();
  }
}
