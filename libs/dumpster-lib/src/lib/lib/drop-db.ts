import { openDb } from './open-db';

// helper to delete all records in a database
export const dropDb = async function(options) {
  const obj = await openDb(options);
  await (obj as any).col.deleteMany({});
  console.log('dropped');
  const count = await (obj as any).col.countDocuments();
  console.log('  - now ' + count + ' records - ');
};
