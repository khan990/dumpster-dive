/* eslint-disable @typescript-eslint/camelcase */
const chalk = require('chalk');
import { openDb as openDB } from './db/open-db';
import * as fns from './db/fns';
import { config } from '../config/config';

//a periodic status-logger for the import
class Logger {

  options: any;
  wait: number;
  please_stop: boolean;

  constructor(options: any) {
    this.options = options;
    this.wait = config.logInterval;
    this.please_stop = false;
  }
  open(cb: any) {
    openDB(this.options.db);
  }
  triggerNext() {
    setTimeout(() => {
      this.stat();
    }, this.wait);
  }
  start() {
    this.triggerNext();
  }
  stop() {
    this.please_stop = true;
  }
  //# of records entered in db
  count(obj: any) {
    return obj.col.countDocuments();
  }
  //get the most recent article written
  lastPage(obj: any) {
    return obj.col
      .find({})
      .sort({
        $natural: -1
      })
      .limit(1)
      .toArray();
  }
  //log some output
  async stat() {
    // console.time('stat')
    const obj = await openDB(this.options);
    let count = await this.count(obj);
    let page = await this.lastPage(obj);
    if (page && page[0]) {
      page = page[0];
      count = fns.niceNumber(count);
      console.log('');
      console.log(
        chalk.grey('     current: ') +
          chalk.green(count) +
          ' pages' +
          chalk.blue(' - "' + page.title + '"     ')
      );
      console.log('');
    }
    await (obj as any).client.close();
    // console.timeEnd('stat')
    //fire the next one!
    if (!this.please_stop) {
      this.triggerNext();
    }
  }
}

export const hound = function(options: any) {
  return new Logger(options);
};
