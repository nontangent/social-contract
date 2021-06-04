import cluster from 'cluster';
import { cpus } from 'os';
import { run } from './run';

async function manager(num: number) {
  for (let i = 0; i < num; i++) cluster.fork();
  cluster.on('exit', worker => console.log(`worker ${worker.process.pid} died`));
}

async function worker() {
  const options = {
    laps: 20,
    interval: 0,
    n: 8,
    honestNum: 2,
    presentation: false,
  };

  for (let i = 0; i < 10; i++) {
    // await run(options)
    await run();
  }

  process.exit();
}

async function multi(num: number = cpus().length) {
  await cluster.isMaster ? manager(num) : worker();
}

if (require?.main === module) {
  multi();
}