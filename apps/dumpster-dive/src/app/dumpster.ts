/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/camelcase */
// #! /usr/bin/env node
import * as dumpster from '@dumpster/dumpster-lib';
import * as yargs from 'yargs';
const argv = yargs
  .usage('dumpster <xml filepath> [options]')
  .example('dumpster ./my/wikipedia-dump.xml --plaintext true --categories false', 'Example command')
  .describe('batch_size', 'how many articles to write to mongo at once [1000]')
  .describe('skip_disambig', 'avoid storing disambiguation pages [true]')
  .describe('skip_redirects', 'avoid storing redirect pages [true]')
  .describe('categories', 'include category data? [true]')
  .describe('citations', 'include references/citations? [true]')
  .describe('coordinates', 'include coordinate data? [true]')
  .describe('infoboxes', 'include infobox data? [true]')
  .describe('images', 'include image data? [true]')
  .describe('plaintext', 'include page plaintext? [false]')
  .describe('verbose', 'run in verbose mode [false]')
  .describe('verbose_skip', 'log skipped disambigs & redirects [false]')
  .describe('workers', 'run in verbose mode [CPUCount]').argv;

const defaults = {
  batch_size: 500,
  skip_disambig: true,
  skip_redirects: true,
  categories: true,
  citations: true,
  coordinates: true,
  infoboxes: true,
  images: true,
  plaintext: false,
  verbose: false,
  verbose_skip: false
};
const toBool = {
  true: true,
  false: false
};

const file = argv['_'][0];
//set defaults to given arguments
const options = Object.assign({}, defaults);
Object.keys(options).forEach((k) => {
  if (argv.hasOwnProperty(k) && argv[k] !== undefined) {
    //coerce strings to booleans
    if (toBool.hasOwnProperty(argv[k] as any)) {
      argv[k] = toBool[argv[k] as any];
    }
    options[k] = argv[k];
  }
});

//grab the wiki file
if (!file) {
  console.log('❌ please supply a filename to the wikipedia article dump');
  process.exit(1);
}
//try to make-up the language name for the db
let db: any = 'wikipedia';
if (file.match(/-(latest|\d{8})-pages-articles/)) {
  db = file.match(/([a-z]+)-(latest|\d{8})-pages-articles/) || [];
  db = db[1] || 'wikipedia';
}
(options as any).file = file;
(options as any).db = db;
dumpster.main(options, undefined);
