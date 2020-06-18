/* eslint-disable @typescript-eslint/camelcase */
export const config = {
  //number of pages to write at a time, to the queue
  batch_size: 200,
  //the default name of the collection to write to
  collection: 'pages',
  //update interval
  logInterval: 10000,
  //which wikipedia namespace to parse
  namespace: 0
};
