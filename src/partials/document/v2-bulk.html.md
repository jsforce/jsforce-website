---
---

## Bulk V2 API

The `bulk2` module provides some helpers to work with data using the Bulk V2 API.

### Upload records

First, assume we have an array of records to insert into Salesforce.

```javascript
//
// Records to insert in bulk.
//
const accounts = [
  { Name : 'Account #1' },
  { Name : 'Account #2' },
  { Name : 'Account #3' },
];
```

Now let's create an object represeting a Bulk V2 ingest job by calling the `BulkV2.createJob()` method on the `connection.bulk2` object,
then call `job.open()` to start the job in your org:

```javascript
const job = conn.bulk2.createJob({
  operation: "insert",
  object: "Account",
})

// the `open` event will be emitted when the job is created.
job.on('open', (job) => {
  console.log(`Job ${job.id} succesfully created.`)
})

await job.open()
```

Now upload the records for the job and then close it so the data starts being processed.

```javascript
// it accepts CSV as a string, an array of records or a Node.js readable stream.
await job.uploadData(accounts)


// uploading data from a CSV as a readable stream:

// const csvStream = fs.createReadStream(
//   path.join('Account_bulk2_test.csv'),
// );
// await job.uploadData(csvStream)

await job.close()
```

<b>NOTE</b>:
Bulk V2 jobs expect the data to be uploaded all at once, if you call `job.uploadData()` more than once it will fail.

Once the job is closed you can start polling for its status until it finished successfully:

```javascript
// by default will poll every 1s and timeout after 30s.
await job.poll()

// you can specify different values (in miliseconds):
// const pollInterval = 30000 
// const pollTimeout = 300000
//
// poll for the job status every 30s and timeout after 5min
// await job.poll(pollInterval, pollTimeout)
```

You can also listen to the `inProgress` event to get updates on each poll:

```javascript
job.on('inProgress', (jobInfo: JobInfoV2) => {
  console.log(jobInfo.numberRecordsProcessed) // Number of records already processed
  console.log(jobInfo.numberRecordsFailed)    // Number of records that failed to be processed
});

await job.poll()
```

Once the job finishes successfully you can get all the records:

```javascript
const res = await job.getAllResults()

 for (const rec of res.successfulResults) {
   console.log(`id = ${rec.sf__Id}, loaded successfully`)
 }
 for (const rec of res.failedResults) {
   console.log(`id = ${rec.sf__Id}, failed to load due to: ${rec.sf__Error}`)
 }
 for (const rec of res.unprocessedRecords) {
   if (typeof rec === 'string') {
     console.log(`Bad record: ${rec}`)
   } else {
     console.log(`unprocessed record: ${rec}`)
   }
 }
```

Alternatively, you can use the `BulkV2.loadAndWaitForResults` method which takes your data and handles job creation/polling/getting results for you:

```javascript
const {
  successfulResults,
  failedResults,
  unprocessedRecords,
} = await conn.bulk2.loadAndWaitForResults({
  object: 'Account',
  operation: 'insert',
  input: records,
  pollTimeout: 60000,
  pollInterval: 5000
});
```

### Bulk V2 Query

The `bulk2.query` method takes a SOQL query and returns a record stream you can use to collect the emitted records.
A streaming API allows to work with tons of records without running into memory limits.

```javascript
const recordStream = await conn.bulk2.query('SELECT Name from Account')

recordStream.on('record', (data) => {
  console.log(record.Id);
});

recordStream.on('error', (err) => {
  throw err;
});

// Or if you need an array of all the records:
const records = await (await bulk2.query('SELECT Name from Account')).toArray()
```

```javascript
// stream records to a csv file 
const fs = require('node:fs');

const recordStream = await conn.bulk2.query('SELECT Name from Account')
recordStream.stream().pipe(fs.createWriteStream('./accounts.csv'));
```

### Query-and-Update/Destroy using Bulk V2 API

When performing [update/delete queried records](#update-delete-queried-records),
JSforce hybridly uses [CRUD Operation for Multiple-Records](#operation-for-multiple-records) and Bulk API.

It uses SObject Collection API for small amount of records, and when the queried result exceeds an threshold, switches to Bulk API.
This can be modified by passing options like `allowBulk`, `bulkThreshold` and `bulkApiVersion`.

```javascript
/* @interactive */
const rets = conn.sobject('Account')
  .find({ CreatedDate: jsforce.Date.TODAY })
  .destroy({
    allowBulk: true, // allow using bulk API
    bulkThreshold: 200, // when the num of queried records exceeds this threshold, switch to Bulk API
    bulkApiVersion: 2 // use Bulk V2 API (default: 1)
  });

for (const ret of rets) {
  console.log('id: ' + ret.id + ', success: ' + ret.success);
}
```
