const chalk = require('chalk');
const sundayDriver = require('sunday-driver');
const parsePage = require('./01-parsePage');
const parseWiki = require('./02-parseWiki');
const writeDb = require('./03-write-db');
const jsonfn = require('jsonfn').JSONfn;
const niceNum = require('../lib/fns').niceNumber;
const stringify = require('json-stringify-pretty-compact');
const { string } = require('yargs');
const fs = require('fs');

const doSection = async (optionStr, workerCount, workerNum) => {
  const options = jsonfn.parse(optionStr);
  let pages = [];
  const percent = 100 / workerCount;
  const start = percent * workerNum;
  const end = start + percent;
  this.counts = {
    pages: 0,
    redirects: 0,
    ns: 0,
    disambig: 0
  };
  this.logger = setInterval(() => {
    console.log(`      ${chalk.yellow('─── worker #' + workerNum + ' ───')}: `);
    console.log(`         ${chalk.green('+' + niceNum(this.counts.pages))} ${chalk.grey('pages')}`);
    console.log(
      `         ${chalk.magenta(niceNum(this.counts.redirects * -1))} ${chalk.grey('redirects')}`
    );
    console.log(
      `         ${chalk.magenta(niceNum(this.counts.disambig * -1))} ${chalk.grey('disambig')}`
    );
    console.log(`         ${chalk.magenta(niceNum(this.counts.ns * -1))} ${chalk.grey('ns')}`);
  }, 20000 + workerNum * 15);
  // console.log(`#${workerNum} -   ${start}% → ${end}%`)
  const driver = {
    file: options.file,
    start: `${start}%`,
    end: `${end}%`,
    splitter: '</page>',
    each: (xml, resume) => {
      // pull-out sections from this xml
      let page = parsePage(xml, this);
      if (page !== null) {
        if (options.verbose === true) {
          console.log('   #' + workerNum + '  - ' + page.title);
        }
        //parse the page into json
        page = parseWiki(page, options, this);
        if (page !== null) {
          let hasAList = false;
          
          if (page.sections != null && page.sections.length > 0) {
            Object.keys(page).forEach((key) => {
              if (key != 'sections' && key != 'title' && key != '_id' && key != 'pageID') {
                page[key] = undefined;
              }
            })

            page.sections.forEach((section) => {
              Object.keys(section).forEach((key) => {
                if (key !== 'lists') {
                  section[key] = undefined;
                }
              })
              if (section.lists) {
                hasAList = true;
              }
            });
            if (hasAList) {
              pages.push(page);
            }
          }
        }
      }
      if (pages.length >= options.batch_size) {
        fs.appendFile('lists.json', stringify(pages), function (err) {
          if (err) throw err;
          console.log('Updated!');
          resume();
        });
      } else {
        resume();
      }
    }
  };
  const p = sundayDriver(driver);
  p.catch(err => {
    console.log(chalk.red('\n\n========== Worker error!  ====='));
    console.log('🚨       worker #' + workerNum + '           🚨');
    console.log(err);
    console.log('\n\n');
  });
  p.then(async () => {
    //on done
    clearInterval(this.logger);
    // insert the remaining pages
    if (pages.length > 0) {
      // await writeDb(options, pages, workerNum);
      fs.appendFile('lists.json', stringify(pages), function (err) {
        if (err) throw err;
        console.log('Updated and End!');
      });
    }
    console.log('\n');
    console.log(`    💪  worker #${workerNum} has finished 💪 `);
    process.send({
      type: 'workerDone',
      pid: process.pid
    });
  });
  return process.pid;
};

module.exports = {
  doSection: doSection
};
