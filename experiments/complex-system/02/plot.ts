import { BaseSimulationPlotter } from '@social-contract/instruments/plotter';
import { ISimulation } from '@social-contract/instruments/models';
import { LABEL } from './meta';
import { PlayerType } from './players';

export class Plotter extends BaseSimulationPlotter {
  isHonestPlayer(type: PlayerType): boolean {
    return type === 'A';
  }

  isSuccess(simulation: ISimulation): boolean {
    return Object.entries(simulation.playersInfo)
      // .filter(([_, type]) => this.isHonestPlayer(type as PlayerType))
      .map(([id, _]) => id)
      .map(id => simulation.results?.find(result => result.ownerId === id))
      .every(results => results?.true === 1);
  };
}

export async function plot() {
  const plotter = new Plotter();
  const data = await plotter.getBarChartData(LABEL);
  process.stdout.write(JSON.stringify(data) + '\n');
}

if (require?.main === module) {
  plot();
}