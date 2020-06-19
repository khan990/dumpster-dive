/* eslint-disable @typescript-eslint/no-empty-function */
//stream a big wikipedia xml.bz2 file into mongodb
//  because why not.
import * as chalk from 'chalk';
import { prepWork as prelim } from './01-prepwork';
import { WorkerPool } from './02-Worker-pool';
import { hound } from './03-logger';
import { openDb as openDB } from './lib/open-db';
import * as fns from './lib/fns';

const oneSec = fns.oneSec;
const start = Date.now();
const noop = function () {};

const finish = async function (options) {
  const obj = await openDB(options);
  console.log('\n\n      👍  closing down.\n');
  const count = await (obj as any).col.countDocuments();
  const duration = fns.timeSince(start);
  console.log('     -- final count is ' + chalk.magenta(fns.niceNumber(count)) + ' pages --');
  console.log('       ' + chalk.yellow(`took ${duration}`));
  console.log('              🎉');
  console.log('\n\n');
  await (obj as any).client.close();
  process.exit();
};

//open up a mongo db, and start xml-streaming..
export const main = (options, done) => {
  done = done || noop;

  //make sure the file exists, and things
  options = prelim(options);
  //init workers
  const workers = new WorkerPool(options);
  workers.start();

  //start the logger:
  const logger = hound(options);
  logger.start();

  workers.on('allWorkersFinished', () => {
    logger.stop();
    oneSec(async () => {
      await done();
      oneSec(() => {
        finish(options);
      });
    });
  });

  //handle ctrl-c gracefully
  process.on('SIGINT', async function () {
    logger.stop();
    workers.cleanup();
    oneSec(() => {
      process.exit();
    });
  });
};
