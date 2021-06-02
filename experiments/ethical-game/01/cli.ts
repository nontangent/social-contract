import { Command } from 'commander';
import { plot } from './plotter';
import { run } from './run';

const cli = new Command();
cli
  .option('--plot', 'plot results')
  .option('--laps <laps>', 'product of number of trials and number of combinations', n => parseInt(n, 10), 1)
  .option('--interval <interval>', 'sleep time of each trials', n => parseInt(n, 10), 100)
  .option('-p --players-code <playersCode>', 'number of Player Type A', n => parseInt(n, 10), undefined)
  .parse(process.argv)
  .action(async (options) => {
    if (options.plot) {
      await plot();
      return;
    }

    await run({
      laps: options.laps,
      interval: options.interval,
      n: 16,
    });
  });

// async function main() {
//   const _options = cli.opts();
//   const options: Options = {
//     laps: _options.laps,
//     interval: _options.interval,
//     playerMap: {
//       A: _options.A,
//       B: _options.B,
//       C: _options.C,
//       D: _options.D,
//       E: _options.E,
//       F: _options.F,
//       G: _options.G,
//       H: _options.H,
//     }
//   };
//   console.debug('options:', options);
//   await run(options);
// }

async function main() {
  await cli.parseAsync(process.argv);
}
main();