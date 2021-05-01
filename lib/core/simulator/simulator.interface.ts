import { SuccessRateRecorder } from "../recorder";

export interface ISimulator<Player> {
  t: number;
  n: number;
  players: Player[];
  recorderMap: {[key: string]: SuccessRateRecorder};

  run(maxCount: number): void;
}