export const zeroPad = (n: number, zero: number) => `${n}`.padStart(zero, '0');
export const zeroPad2 = (n: number) => zeroPad(n, 2);
export const zeroPad3 = (n: number) => zeroPad(n, 3);
export const zeroPad4 = (n: number) => zeroPad(n, 4);
export const zeroPad5 = (n: number) => zeroPad(n, 5);
export const zeroPad6 = (n: number) => zeroPad(n, 6);
export const zeroPad7 = (n: number) => zeroPad(n, 7);

export const z2 = (n: number) => zeroPad(n, 2);
export const z3 = (n: number) => zeroPad(n, 3);
export const z4 = (n: number) => zeroPad(n, 4);
export const z5 = (n: number) => zeroPad(n, 5);
export const z6 = (n: number) => zeroPad(n, 6);
export const z7 = (n: number) => zeroPad(n, 7);

export const blankPad = (str: string | number, zero: number) => `${str}`.padStart(zero, ' ');
export const b2 = (str: string | number) => blankPad(`${str}`, 2);
export const b3 = (str: string | number) => blankPad(`${str}`, 3);
export const b4 = (str: string | number) => blankPad(`${str}`, 4);
export const b5 = (str: string | number) => blankPad(`${str}`, 5);
export const b6 = (str: string | number) => blankPad(`${str}`, 6);
export const b7 = (str: string | number) => blankPad(`${str}`, 7);
export const b8 = (str: string | number) => blankPad(`${str}`, 8);
export const b9 = (str: string | number) => blankPad(`${str}`, 9);
export const b10 = (str: string | number) => blankPad(`${str}`, 10);

export const f2 = (n: number) => Math.round(n * 10) / 10;

export const p100 = (n: number): string => `${b3(Math.round(n * 100))}%`;
