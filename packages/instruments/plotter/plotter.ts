import { PlayerId } from "@social-contract/libs/core";
import { ISimulation } from "../models";
import { MySQLRepository } from "../repositories";

 export abstract class BaseSimulationPlotter {
  private repository: MySQLRepository = new MySQLRepository('social_contract_development');

  async getBarChartData(label: string): Promise<BarChartData> {
    await this.repository.connect();
    const simulations = await this.repository.getSimulationsByLabel(label);
    const data = this.buildBarChartData(label, simulations);
    await this.repository.close();
    return data;
  }

  buildBarChartData(label: string, simulations: ISimulation[]): BarChartData {
    const counts: Record<string, boolean[]> = {};

    for (const simulation of simulations) {
      // 誠実なプレイヤーの人数と全体の人数を取得
      const [honest, all] = this.countPlayers(simulation.playersInfo);
      const key = `${honest}`;
      const result = this.isSuccess(simulation);
      counts[key] = counts?.[key] ?? [];
      counts[key].push(result);

      if (honest === 5 && result === false) {
        console.debug(simulation);
      } 
    }

    const dataset = Object.entries(counts).reduce((pre, [key, results]) => ({
      ...pre,
      [key]: results.filter(r => r).length / results.length,
    }), this.buildBaseDataset(simulations?.[0]));

    return { label, dataset}
  }

  countPlayers(playersInfo: Record<PlayerId, string>): [number, number] {
    const count = Object.values(playersInfo).reduce((count, info) => ({
      honest: count.honest + (this.isHonestPlayer(info) ? 1 : 0),
      all: count.all + 1
    }), {honest: 0, all: 0});
    return [count.honest, count.all];
  }

  buildBaseDataset(simulation: ISimulation): Record<string, number> {
    const N = Object.keys(simulation.playersInfo).length;
    return [...Array(N+1)].map((_, i) => i).reduce((pre, key) => ({...pre, [key]: 0}), {});
  }

  abstract isHonestPlayer(info: string): boolean;
  abstract isSuccess(simulation: ISimulation): boolean;

}


export interface BarChartData {
  label: string;
  dataset: Record<string, number>;
}