import { SuccessRateRecorder } from '@social-contract/instruments/recorders';

export interface ISimulator<Player> {
  t: number;
  n: number;
  players: Player[];
  recorderMap: Map<Player | string, SuccessRateRecorder>;

  run(maxCount: number): void;
}