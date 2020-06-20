const chalk = require('chalk');
const sundayDriver = require('sunday-driver');
import { parsePage } from './01-parsePage';
import { parseWiki } from './02-parseWiki';
import { writeDb } from './03-write-db';
const jsonfn = require('jsonfn').JSONfn;
const niceNum = require('../db/fns').niceNumber;

declare var process: any;
class doSectionClass {

  public doSection = async (optionStr: any, workerCount: any, workerNum: any) => {
    const options = jsonfn.parse(optionStr);
    let pages: any[] = [];
    const percent = 100 / workerCount;
    const start = percent * workerNum;
    const end = start + percent;
    (this as any).counts = {
      pages: 0,
      redirects: 0,
      ns: 0,
      disambig: 0
    };
    (this as any).logger = setInterval(() => {
      console.log(`      ${chalk.yellow('─── worker #' + workerNum + ' ───')}: `);
      console.log(`         ${chalk.green('+' + niceNum((this as any).counts.pages))} ${chalk.grey('pages')}`);
      console.log(
        `         ${chalk.magenta(niceNum((this as any).counts.redirects * -1))} ${chalk.grey('redirects')}`
      );
      console.log(
        `         ${chalk.magenta(niceNum((this as any).counts.disambig * -1))} ${chalk.grey('disambig')}`
      );
      console.log(`         ${chalk.magenta(niceNum((this as any).counts.ns * -1))} ${chalk.grey('ns')}`);
    }, 20000 + workerNum * 15);
    // console.log(`#${workerNum} -   ${start}% → ${end}%`)
    const driver = {
      file: options.file,
      start: `${start}%`,
      end: `${end}%`,
      splitter: '</page>',
      each: (xml: any, resume: any) => {
        // pull-out sections from this xml
        let page = parsePage(xml, this);
        if (page !== null) {
          if (options.verbose === true) {
            console.log('   #' + workerNum + '  - ' + page.title);
          }
          //parse the page into json
          page = parseWiki(page, options, this);
          if (page !== null) {
            pages.push(page);
          }
        }
        if (pages.length >= options.batch_size) {
          writeDb(options, pages, workerNum).then(() => {
            (this as any).counts.pages += pages.length;
            pages = [];
            resume();
          });
        } else {
          resume();
        }
      }
    };
    const p = sundayDriver(driver);
    p.catch((err: any) => {
      console.log(chalk.red('\n\n========== Worker error!  ====='));
      console.log('🚨       worker #' + workerNum + '           🚨');
      console.log(err);
      console.log('\n\n');
    });
    p.then(async () => {
      //on done
      clearInterval((this as any).logger);
      // insert the remaining pages
      if (pages.length > 0) {
        await writeDb(options, pages, workerNum);
      }
      console.log('\n');
      console.log(`    💪  worker #${workerNum} has finished 💪 `);
      process.send({
        type: 'workerDone',
        pid: process.pid
      });
    });
    return process.pid;
  }

}

export const doSection = new doSectionClass().doSection;
// export const doSection = async (optionStr: any, workerCount: any, workerNum: any) => {
//   const options = jsonfn.parse(optionStr);
//   let pages: any[] = [];
//   const percent = 100 / workerCount;
//   const start = percent * workerNum;
//   const end = start + percent;
//   this.counts = {
//     pages: 0,
//     redirects: 0,
//     ns: 0,
//     disambig: 0
//   };
//   this.logger = setInterval(() => {
//     console.log(`      ${chalk.yellow('─── worker #' + workerNum + ' ───')}: `);
//     console.log(`         ${chalk.green('+' + niceNum(this.counts.pages))} ${chalk.grey('pages')}`);
//     console.log(
//       `         ${chalk.magenta(niceNum(this.counts.redirects * -1))} ${chalk.grey('redirects')}`
//     );
//     console.log(
//       `         ${chalk.magenta(niceNum(this.counts.disambig * -1))} ${chalk.grey('disambig')}`
//     );
//     console.log(`         ${chalk.magenta(niceNum(this.counts.ns * -1))} ${chalk.grey('ns')}`);
//   }, 20000 + workerNum * 15);
//   // console.log(`#${workerNum} -   ${start}% → ${end}%`)
//   const driver = {
//     file: options.file,
//     start: `${start}%`,
//     end: `${end}%`,
//     splitter: '</page>',
//     each: (xml: any, resume: any) => {
//       // pull-out sections from this xml
//       let page = parsePage(xml, this);
//       if (page !== null) {
//         if (options.verbose === true) {
//           console.log('   #' + workerNum + '  - ' + page.title);
//         }
//         //parse the page into json
//         page = parseWiki(page, options, this);
//         if (page !== null) {
//           pages.push(page);
//         }
//       }
//       if (pages.length >= options.batch_size) {
//         writeDb(options, pages, workerNum).then(() => {
//           this.counts.pages += pages.length;
//           pages = [];
//           resume();
//         });
//       } else {
//         resume();
//       }
//     }
//   };
//   const p = sundayDriver(driver);
//   p.catch((err: any) => {
//     console.log(chalk.red('\n\n========== Worker error!  ====='));
//     console.log('🚨       worker #' + workerNum + '           🚨');
//     console.log(err);
//     console.log('\n\n');
//   });
//   p.then(async () => {
//     //on done
//     clearInterval(this.logger);
//     // insert the remaining pages
//     if (pages.length > 0) {
//       await writeDb(options, pages, workerNum);
//     }
//     console.log('\n');
//     console.log(`    💪  worker #${workerNum} has finished 💪 `);
//     process.send({
//       type: 'workerDone',
//       pid: process.pid
//     });
//   });
//   return process.pid;
// };
