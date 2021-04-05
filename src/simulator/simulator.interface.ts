import { IPlayer } from '../player';

export interface ISimulator<T> {
  t: number;
  n: number;
  players: IPlayer<T>[];

  run(maxCount: number): void;
}