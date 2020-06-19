import * as chalk from 'chalk';
import { openDb } from '@dumpster/dumpster-lib';
import * as fns from '@dumpster/dumpster-lib';
const niceNumber = fns.niceNumber;
const dbName = process.argv[2] || 'enwiki';

const showPage = async function(col) {
  const docs = await col.aggregate({
    $sample: {
      size: 1
    }
  });
  console.log(docs);
  console.log('\n\n\n');
};

//cool moves,
const main = async function() {
  const obj = await openDb({
    db: dbName
  });
  const count = await (obj as any).col.count();
  console.log(chalk.blue('\n\n   ----------- ' + niceNumber(count) + ' pages total -----------\n'));
  await showPage((obj as any).col);
  await (obj as any).client.close();
};
main();
