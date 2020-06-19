import * as pretty from 'prettysize';
import * as WorkerNodes from 'worker-nodes';
import * as fs from 'fs';
import * as chalk from 'chalk';
import * as EventEmitter from 'events';
import * as fns from './lib/fns';
const jsonfn = require('jsonfn').JSONfn;
const right = fns.alignRight;
const niceTime = fns.niceTime;
const margin = '         ';
//estimate of duration:
const mbPerMinute = 45; //new macbooks are ~58

export class WorkerPool extends EventEmitter {

  options: any;
  workerCount: any;
  running: number;
  workerNodes: any;
  workers: number;
  skippedRedirects: number;
  skippedDisambigs: number;
  fileSize: number;
  chunkSize: number;

  constructor(options) {
    super();
    this.options = options;
    this.workerCount = options.workers;
    this.running = 0;
    this.workerNodes = new WorkerNodes(__dirname + '/worker/index.js', {
      minWorkers: this.workers,
      autoStart: true,
      maxTasksPerWorker: 1
    });
    this.skippedRedirects = 0;
    this.skippedDisambigs = 0;
    this.fileSize = fs.statSync(options.file)['size'];
    this.chunkSize = Math.floor(this.fileSize / this.workerCount);
  }

  printHello() {
    const megaBytes = this.chunkSize / 1048576; //1,048,576
    const duration = megaBytes / mbPerMinute;
    console.log('\n\n\n' + margin + '---------------------------');
    console.log(margin + chalk.yellow(`         oh hi `) + `👋`);
    console.log(
      margin + chalk.green(`size:`) + `        ${chalk.green(right(pretty(this.fileSize)))}`
    );
    console.log(margin + `             ${chalk.blue(right(this.workerCount + ' workers'))}`);
    console.log(margin + `             ${chalk.magenta(right(pretty(this.chunkSize) + ' each'))}`);
    console.log(margin + chalk.red(`estimate:`) + `    ${chalk.red(right(niceTime(duration)))}`);
    console.log(margin + '---------------------------');
    console.log('\n');
  }

  isDone() {
    this.running -= 1;
    console.log(chalk.grey('      - ' + this.running + ' workers still running -\n'));
    if (this.running === 0) {
      this.workerNodes.terminate().then(() => {
        this.emit('allWorkersFinished'); //send this up to parent
      });
    }
  }

  //pay attention to them when they finish
  listen() {
    this.workerNodes.workersQueue.storage.forEach(worker => {
      worker.process.child.on('message', msg => {
        // this.emit('msg', msg);
        if (msg.type === 'workerDone') {
          this.isDone();
        }
      });
    });
  }

  start() {
    const options = this.options;
    this.printHello();
    //convoluted loop to wire-up each worker
    for (let i = 0; i < this.workerCount; i += 1) {
      //stringify options, so it gets passed to the web worker
      const optionStr = jsonfn.stringify(options);
      this.workerNodes.call.doSection(optionStr, this.workerCount, i).then(() => {
        this.running += 1;
        //once all workers have been started..
        if (this.running === this.workerCount) {
          this.listen();
        }
      });
    }
  }

  cleanup() {
    console.log(chalk.blue('\none sec, cleaning-up the workers...'));
    this.workerNodes.terminate();
  }
}
