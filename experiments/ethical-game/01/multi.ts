import { Options } from '@social-contract/experiments/options';
import cluster from 'cluster';
import { cpus } from 'os';
import { run } from './run';

async function manager(num: number) {
  for (let i = 0; i < num; i++) cluster.fork();
  cluster.on('exit', (worker) => console.log(`worker ${worker.process.pid} exited.`));
}

async function worker(options: Options) {
  for (let i = 0; i < options.sample / options.multi; i++) {
    console.debug('i:', i);
    await run(options)
  }
  process.exit();
}

async function multi(options: Options) {
  await cluster.isMaster ? manager(options.multi) : worker(options);
}

if (require?.main === module) {
  const options: Options = {
    laps: 20,
    interval: 0,
    n: 8,
    presentation: false,
    sample: 800,
    multi: cpus().length,
    honestNum: 5,
  };
  if (options.sample % options.multi !== 0) throw new Error('the number of sample is divisible by options.multi');
  multi(options);
}