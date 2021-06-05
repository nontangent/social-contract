export interface Options {
  laps: number;
  interval: number;
  n: number;
  honestNum?: number,
  sample: number,
  multi: number,
  presentation: boolean;
  playersCode?: string;
}

export const defaultOption: Options = {
  laps: 20,
  interval: 100,
  n: 16,
  presentation: true,
  sample: 1,
  multi: 1,
};