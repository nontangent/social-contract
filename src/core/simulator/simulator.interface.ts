export interface ISimulator<Player> {
  t: number;
  n: number;
  players: Player[];

  run(maxCount: number): void;
}