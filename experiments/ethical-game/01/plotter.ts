import { BaseSimulationPlotter } from '@social-contract/instruments/plotter';
import { ISimulation } from '@social-contract/instruments/models';
import { LABEL } from './meta';

export class Plotter extends BaseSimulationPlotter {
  
  isHonestPlayer(type: string): boolean {
    return type === 'A';
  }

  isSuccess(simulation: ISimulation): boolean {
    return simulation.results?.[0]?.true === 1;
  };

}

export async function plot() {
  const plotter = new Plotter();
  const data = await plotter.getBarChartData(LABEL);
  console.debug('data:', data);
}

if (require?.main === module) {
  plot();
}