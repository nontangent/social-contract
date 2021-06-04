import { randomChoice } from "@social-contract/libs/utils/helpers";

export function randomPlayersCode(playerTypes: string[], length: number, fixed?: {type: string, n: number}): string {
  let players;
  while (true) {
    players = [...Array(length)].map(() => randomChoice(playerTypes));
    if (fixed === undefined || players.filter(p => p === fixed.type).length === fixed.n) break;
  }
  return players.join('');
}