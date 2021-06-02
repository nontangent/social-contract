import { SuccessRateRecorder } from '@social-contract/instruments/recorders';
import { PlayerId } from '@social-contract/libs/core';

export interface ISimulator<Player> {
  id: string;
  label: string;
  description: string;
  playersInfo: Record<PlayerId, string>;

  t: number;
  n: number;
  players: Player[];
  recorderMap: Map<Player | string, SuccessRateRecorder>;

  run(maxCount: number): void;
}