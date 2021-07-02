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
  interval: 0,
  n: 8,
  presentation: true,
  sample: 1,
  multi: 1,
};