---
---

## Bulk API

JSforce package also supports Bulk API. It is not only mapping each Bulk API endpoint in low level,
but also introducing utility interface in bulk load operations.


### Load From Records

First, assume that you have record set in array object to insert into Salesforce.

```javascript
//
// Records to insert in bulk.
//
const accounts = [
{ Name : 'Account #1', ... },
{ Name : 'Account #2', ... },
{ Name : 'Account #3', ... },
...
];
```

You could use `SObject.create(record)`, but it consumes API quota per record,
so it's not practical for large set of records. We can use the Bulk API to load them.

Similar to the Bulk API, first create a bulk job by calling `Bulk.createJob(sobjectType, operation)`
through `bulk` API object in connection object.

Next, create a new batch in the job, by calling `job.createBatch()` through the job object created previously.

```javascript
const job = conn.bulk.createJob("Account", "insert");
const batch = job.createBatch();
```

Then bulk load the records by calling `batch.execute(input)` of created batch object, passing the records in `input` argument.

When the batch is queued in Salesforce, it is notified by emitting the `queue` event, and you can get job ID and batch ID.

```javascript
batch.execute(accounts);
batch.on("queue", (batchInfo) => { // fired when batch request is queued in server.
  console.log('batchInfo:', batchInfo);
  batchId = batchInfo.id;
  jobId = batchInfo.jobId;
  // ...
});
```

After the batch is queued and job / batch ID is created, wait the batch completion by polling.

When the batch process in Salesforce has been completed, it is notified by `response` event with batch result information.

```javascript
const job = conn.bulk.job(jobId);
const batch = job.batch(batchId);
batch.poll(1000 /* interval(ms) */, 20000 /* timeout(ms) */); // start polling
batch.on("response", (rets) => { // fired when batch is finished and result retrieved
  for (let i=0; i < rets.length; i++) {
    if (rets[i].success) {
      console.log(`#${i + 1} loaded successfully, id = ${rets[i].id}`);
    } else {
      console.log(`#${i + 1} error occurred, message = ${rets[i].errors.join(', ')}`);
    }
  }
  // ...
});
```

Below is an example of the full bulk loading flow from scratch.

```javascript
/* @interactive */
// Provide records
const accounts = [
  { Name : 'Account #4' },
  { Name : 'Account #6' },
  { Name : 'Account #7' },
];
// Create job and batch
const job = conn.bulk.createJob("Account", "insert");
const batch = job.createBatch();
// start job
batch.execute(accounts);
// listen for events
batch.on("error", function(batchInfo) { // fired when batch request is queued in server.
  console.log('Error, batchInfo:', batchInfo);
});
batch.on("queue", function(batchInfo) { // fired when batch request is queued in server.
  console.log('queue, batchInfo:', batchInfo);
  batch.poll(1000 /* interval(ms) */, 20000 /* timeout(ms) */); // start polling - Do not poll until the batch has started
});
batch.on("response", (rets) => { // fired when batch finished and result retrieved
  for (let i=0; i < rets.length; i++) {
    if (rets[i].success) {
      console.log(`#${i + 1} loaded successfully, id = ${rets[i].id}`);
    } else {
      console.log(`#${i + 1} error occurred, message = ${rets[i].errors.join(', ')}`);
    }
  }
  // ...
});
```


Alternatively, you can use `Bulk.load(sobjectType, operation, input)` interface to achieve the above process in one method call.

NOTE: In some cases for large data sets, a polling timeout can occur. When loading large data sets, consider changing `Bulk.pollTimeout` and `Bulk.pollInterval` property value, or using the one of the calls above with the built in `batch.poll()` or polling manually.

```javascript
conn.bulk.pollTimeout = 25000; // Bulk timeout can be specified globally on the connection object
const rets = await conn.bulk.load("Account", "insert", accounts);
for (let i=0; i < rets.length; i++) {
  if (rets[i].success) {
    console.log(`#${i + 1} loaded successfully, id = ${rets[i].id}`);
  } else {
    console.log(`#${i + 1} error occurred, message = ${rets[i].errors.join(', ')}`);
  }
}
```

Following are same calls but in different interfaces:

```javascript
const res = await conn.sobject("Account").insertBulk(accounts);
console.log(res)
```

```javascript
const res = await conn.sobject("Account").bulkload("insert", accounts)
console.log(res)
```

To check the status of a batch job without using the built in polling methods, you can use `Bulk.check()`.

```javascript
const results = await conn.bulk.job(jobId).batch(batchId).check()
console.log('results', results);
```

### Load From CSV File

It also supports bulk loading from CSV file. Just use CSV file input stream as `input` argument
in `Bulk.load(sobjectType, operation, input)`, instead of passing records in array.

```javascript
//
// Create readable stream for CSV file to upload
//
const csvFileIn = require('fs').createReadStream("path/to/Account.csv");
//
// Call Bulk.load(sobjectType, operation, input) - use CSV file stream as "input" argument
//
const rets = await conn.bulk.load("Account", "insert", csvFileIn);
for (let i=0; i < rets.length; i++) {
  if (rets[i].success) {
    console.log(`#${i + 1} loaded successfully, id = ${rets[i].id}`);
  } else {
    console.log(`#${i + 1} error occurred, message = ${rets[i].errors.join(', ')}`);
  }
}
```

Alternatively, if you have a CSV string instead of an actual file, but would still like to use the CSV data type, here is an example for node.js.

```javascript
const s = new stream.Readable();
s.push(fileStr);
s.push(null);

const job = conn.bulk.createJob(sobject, operation, options);
const batch = job.createBatch();
batch
.execute(s)
.on("queue", (batchInfo) => {
  console.log('Apex job queued');
  // Since we useed .execute(), we need to poll until completion using batch.poll() or manually using batch.check()
  // See the previous examples for reference
})
.on("error", (err) => {
  console.log('Apex job error');
});
```


`Bulk-Batch.stream()` returns a Node.js standard writable stream which accepts batch input.
You can pipe input stream to it afterward.


```javascript
const batch = await conn.bulk.load("Account", "insert");
batch.on("response", (rets) => { // fired when batch finished and result retrieved
  for (const i=0; i < rets.length; i++) {
    if (rets[i].success) {
      console.log(`#${i + 1} loaded successfully, id = ${rets[i].id}`);
    } else {
      console.log(`#${i + 1} error occurred, message = ${rets[i].errors.join(', ')}`);
    }
  }
);
//
// When input stream becomes available, pipe it to batch stream.
//
csvFileIn.pipe(batch.stream());
```

### Query-and-Update/Destroy using Bulk API

When performing [update/delete queried records](#update-delete-queried-records),
JSforce hybridly uses [CRUD Operation for Multiple-Records](#operation-for-multiple-records) and Bulk API.

It uses SObject Collection API for small amount of records, and when the queried result exceeds an threshold, switches to Bulk API.
These behavior can be modified by passing options like `allowBulk` or `bulkThreshold`.

```javascript
/* @interactive */
const rets = await conn.sobject('Account')
  .find({ CreatedDate: jsforce.Date.TODAY })
  .destroy({
    allowBulk: true, // allow using bulk API
    bulkThreshold: 200, // when the num of queried records exceeds this threshold, switch to Bulk API
  });

for (const ret of rets) {
  console.log(`id: ${ret.id}, success: ${ret.success}`);
}
```

### Bulk Query

From ver. 1.3, additional functionality was added to the bulk query API. It fetches records in bulk in record stream, or CSV stream which can be piped out to a CSV file.

```javascript
/* @interactive */
const recordStream = await conn.bulk2.query('SELECT Id, Name, NumberOfEmployees FROM Account')

recordStream.on('record', (data) => {
  console.log(record.Id);
});

recordStream.on('error', (err) => {
  throw err;
});

```

```javascript
const fs = require('fs');

const recordStream = await conn.bulk.query('SELECT Id, Name, NumberOfEmployees FROM Account')
recordStream.stream().pipe(fs.createWriteStream('./accounts.csv'));
```

If you already know the job id and batch id for the bulk query, you can get the batch result ids by calling `Batch.retrieve()`. Retrieval for each result is done by `Batch.result(resultId)`

```javascript
const fs = require('fs');
const batch = conn.bulk.job(jobId).batch(batchId);
batch.retrieve((err, results) => {
  if (err) { return console.error(err); }
  for (let i=0; i < results.length; i++) {
    var resultId = result[i].id;
    batch.result(resultId).stream().pipe(fs.createWriteStream('./result'+i+'.csv'));
  }
});
```
