import * as chalk from 'chalk';
import { openDb as openDB } from '../db/open-db';
import * as fns from '../db/fns';

const mongoConfig = {
  ordered: false
};

//report how many pages we wrote this time
const writeMsg = function(pages: any, count: any, start: any, workerNum: any) {
  let msg = chalk.yellow(` #${workerNum}  `);
  count = fns.niceNumber(count);
  msg += chalk.green(`+${count} `) + 'pages';
  msg += chalk.grey('  -  ' + fns.timeSince('  ' + start));
  msg += chalk.blue(` - `);
  msg += chalk.magenta(`"${pages[0].title}"`);
  console.log(msg);
};

export const writeDb = async (options: any, pages: any, workerNum: any) => {
  const start = Date.now();
  const obj = await openDB(options);

  const result = await (obj as any).col.insertMany(pages, mongoConfig).catch(async (err: any) => {
    if (err.code === 11000) {
      let errCount = err.result.getWriteErrorCount();
      errCount = fns.niceNumber(errCount);
      console.log(chalk.red(`-- ${errCount}  duplicate pages --`));
    } else {
      console.log(chalk.red(`   ====DB write error (worker ${workerNum})===`));
      console.log(err);
    }
    //pretty-print this duplicate-pages error
    if (err.result) {
      err = err.result.toJSON();
      const count = err.nInserted;
      writeMsg(pages, count, start, workerNum);
    }
    await (obj as any).client.close();
  });
  //no errors thrown, all good
  if (result) {
    const count = result.insertedCount;
    writeMsg(pages, count, start, workerNum);
    await (obj as any).client.close();
  }
};
