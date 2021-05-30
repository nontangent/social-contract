import { Command } from 'commander';
import { Options, run } from './run';

const cli = new Command();
cli
  .option('--laps <laps>', 'product of number of trials and number of combinations', n => parseInt(n, 10), 1)
  .option('--interval <interval>', 'sleep time of each trials', n => parseInt(n, 10), 100)
  .option('-A <A>', 'number of Player Type A', n => parseInt(n, 10), 0)
  .option('-B <B>', 'number of Player Type B', n => parseInt(n, 10), 0)
  .option('-C <C>', 'number of Player Type C', n => parseInt(n, 10), 0)
  .option('-D <D>', 'number of Player Type D', n => parseInt(n, 10), 0)
  .option('-E <E>', 'number of Player Type E', n => parseInt(n, 10), 0)
  .option('-F <F>', 'number of Player Type F', n => parseInt(n, 10), 0)
  .option('-G <G>', 'number of Player Type G', n => parseInt(n, 10), 0)
  .option('-H <H>', 'number of Player Type H', n => parseInt(n, 10), 0)
  .parse(process.argv);

async function main() {
  const _options = cli.opts();
  const options: Options = {
    laps: _options.laps,
    interval: _options.interval,
    playerMap: {
      A: _options.A,
      B: _options.B,
      C: _options.C,
      D: _options.D,
      E: _options.E,
      F: _options.F,
      G: _options.G,
      H: _options.H,
    }
  };
  console.debug('options:', options);
  await run(options);
}

main();