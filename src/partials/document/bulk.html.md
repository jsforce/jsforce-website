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
var accounts = [
{ Name : 'Account #1', ... },
{ Name : 'Account #2', ... },
{ Name : 'Account #3', ... },
...
];
```

You can use `SObject#create(record)`, but it consumes API quota per record,
so not practical for large set of records. We can use bulk API interface to load them.

Similar to Salesforce Bulk API, first create bulk job by `Bulk#createJob(sobjectType, operation)`
through `bulk` API object in connection object.

Next, create a new batch in the job, by calling `Bulk-Job#createBatch()` through the job object created previously.

```javascript
var job = conn.bulk.createJob("Account", "insert");
var batch = job.createBatch();
```

Then bulk load the records by calling `Bulk-Batch#execute(input)` of created batch object, passing the records in `input` argument.

When the batch is queued in Salesforce, it is notified by `queue` event, and you can get job ID and batch ID.

```javascript
batch.execute(accounts);
batch.on("queue", function(batchInfo) { // fired when batch request is queued in server.
  console.log('batchInfo:', batchInfo);
  batchId = batchInfo.id;
  jobId = batchInfo.jobId;
  // ...
});
```

After the batch is queued and job / batch ID is created, wait the batch completion by polling.

When the batch process in Salesforce has been completed, it is notified by `response` event with batch result information.

```javascript
var job = conn.bulk.job(jobId);
var batch = job.batch(batchId);
batch.poll(1000 /* interval(ms) */, 20000 /* timeout(ms) */); // start polling
batch.on("response", function(rets) { // fired when batch is finished and result retrieved
  for (var i=0; i < rets.length; i++) {
    if (rets[i].success) {
      console.log("#" + (i+1) + " loaded successfully, id = " + rets[i].id);
    } else {
      console.log("#" + (i+1) + " error occurred, message = " + rets[i].errors.join(', '));
    }
  }
  // ...
});
```

Below is an example of the full bulk loading flow from scratch.

```javascript
/* @interactive */
// Provide records
var accounts = [
  { Name : 'Account #1' },
  { Name : 'Account #2' },
  { Name : 'Account #3' },
];
// Create job and batch
var job = conn.bulk.createJob("Account", "insert");
var batch = job.createBatch();
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
batch.on("response", function(rets) { // fired when batch finished and result retrieved
  for (var i=0; i < rets.length; i++) {
    if (rets[i].success) {
      console.log("#" + (i+1) + " loaded successfully, id = " + rets[i].id);
    } else {
      console.log("#" + (i+1) + " error occurred, message = " + rets[i].errors.join(', '));
    }
  }
  // ...
});
```


Alternatively, you can use `Bulk#load(sobjectType, operation, input)` interface to achieve the above process in one method call.

NOTE: In some cases for large data sets, a polling timeout can occur. When loading large data sets, consider changing `Bulk#pollTimeout` and `Bulk#pollInterval` property value, or using the one of the calls above with the built in `batch.poll()` or polling manually.

```javascript
conn.bulk.pollTimeout = 25000; // Bulk timeout can be specified globally on the connection object
conn.bulk.load("Account", "insert", accounts, function(err, rets) {
  if (err) { return console.error(err); }
  for (var i=0; i < rets.length; i++) {
    if (rets[i].success) {
      console.log("#" + (i+1) + " loaded successfully, id = " + rets[i].id);
    } else {
      console.log("#" + (i+1) + " error occurred, message = " + rets[i].errors.join(', '));
    }
  }
  // ...
});
```

Following are same calls but in different interfaces:

```javascript
conn.sobject("Account").insertBulk(accounts, function(err, rets) {
  // ...
});
```

```javascript
conn.sobject("Account").bulkload("insert").execute(accounts, function(err, rets) {
  // ...
});
```

To check the status of a batch job without using the built in polling methods, you can use `Bulk#check()`.

```javascript
conn.bulk.job(jobId).batch(batchId).check((err, results) => {
  // Note: all returned data is of type String from parsing the XML response from Salesforce, but the following attributes are actually numbers: apexProcessingTime, apiActiveProcessingTime, numberRecordsFailed, numberRecordsProcessed, totalProcessingTime
  if (err) { return console.error(err); }
  console.log('results', results);
});
```

### Load From CSV File

It also supports bulk loading from CSV file. Just use CSV file input stream as `input` argument
in `Bulk#load(sobjectType, operation, input)`, instead of passing records in array.

```javascript
//
// Create readable stream for CSV file to upload
//
var csvFileIn = require('fs').createReadStream("path/to/Account.csv");
//
// Call Bulk#load(sobjectType, operation, input) - use CSV file stream as "input" argument
//
conn.bulk.load("Account", "insert", csvFileIn, function(err, rets) {
  if (err) { return console.error(err); }
  for (var i=0; i < rets.length; i++) {
    if (rets[i].success) {
      console.log("#" + (i+1) + " loaded successfully, id = " + rets[i].id);
    } else {
      console.log("#" + (i+1) + " error occurred, message = " + rets[i].errors.join(', '));
    }
  }
  // ...
});
```

Alternatively, if you have a CSV string instead of an actual file, but would still like to use the CSV data type, here is an example for node.js.

```javascript
var s = new stream.Readable();
s.push(fileStr);
s.push(null);

var job = conn.bulk.createJob(sobject, operation, options);
var batch = job.createBatch();
batch
.execute(s)
.on("queue", function(batchInfo) {
  console.log('Apex job queued');
  // Since we useed .execute(), we need to poll until completion using batch.poll() or manually using batch.check()
  // See the previous examples for reference
})
.on("error", function(err) {
  console.log('Apex job error');
});
```


`Bulk-Batch#stream()` returns a Node.js standard writable stream which accepts batch input.
You can pipe input stream to it afterward.


```javascript
var batch = conn.bulk.load("Account", "insert");
batch.on("response", function(rets) { // fired when batch finished and result retrieved
  for (var i=0; i < rets.length; i++) {
    if (rets[i].success) {
      console.log("#" + (i+1) + " loaded successfully, id = " + rets[i].id);
    } else {
      console.log("#" + (i+1) + " error occurred, message = " + rets[i].errors.join(', '));
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
conn.sobject('Account')
  .find({ CreatedDate: jsforce.Date.TODAY })
  .destroy({
    allowBulk: true, // allow using bulk API
    bulkThreshold: 200, // when the num of queried records exceeds this threshold, switch to Bulk API
  }, function(err, rets) {
    if (err) { return console.error(err); }
    // destroyed results are returned
    for (const ret of rets) {
      console.log('id: ' + ret.id + ', success: ' + ret.success);
    }
  });
```

### Bulk Query

From ver. 1.3, additional functionality was added to the bulk query API. It fetches records in bulk in record stream, or CSV stream which can be piped out to a CSV file.

```javascript
/* @interactive */
conn.bulk.query("SELECT Id, Name, NumberOfEmployees FROM Account")
  .on('record', function(rec) { console.log(rec); })
  .on('error', function(err) { console.error(err); });
```

```javascript
var fs = require('fs');
conn.bulk.query("SELECT Id, Name, NumberOfEmployees FROM Account")
  .stream().pipe(fs.createWriteStream('./accounts.csv'));
```

If you already know the job id and batch id for the bulk query, you can get the batch result ids by calling `Batch#retrieve()`. Retrieval for each result is done by `Batch#result(resultId)`

```javascript
var fs = require('fs');
var batch = conn.bulk.job(jobId).batch(batchId);
batch.retrieve(function(err, results) {
  if (err) { return console.error(err); }
  for (var i=0; i < results.length; i++) {
    var resultId = result[i].id;
    batch.result(resultId).stream().pipe(fs.createWriteStream('./result'+i+'.csv'));
  }
});
```
