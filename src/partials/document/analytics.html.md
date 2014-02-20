---
---

## Analytics API

By using Analytics API, you can get the output result from a report registered in Salesforce.

### Get Recently Used Reports

`Analytics#reports()` lists recently accessed reports.

```javascript
/* @interactive */
// get recent reports
conn.analytics.reports(function(err, reports) {
  if (err) { return console.error(err); }
  console.log("reports length: "+reports.length);
  for (var i=0; i < reports.length; i++) {
    console.log(reports[i].id);
    console.log(reports[i].name);
  }
  // ...
});
```

### Describe Report Metadata

`Analytics#report(reportId)` gives a reference to the report object specified in `reportId`.
By calling `Analytics-Report#describe()`, you can get the report metadata defined in Salesforce without executing the report.

You should check [Analytics REST API Guide](http://www.salesforce.com/us/developer/docs/api_analytics/index.htm) to understand the structure of returned report metadata.

```javascript
/* @interactive */
var reportId = '00O10000000pUw2EAE';
conn.analytics.report(reportId).describe(function(err, meta) {
  if (err) { return console.error(err); }
  console.log(meta.reportMetadata);
  console.log(meta.reportTypeMetadata);
  console.log(meta.reportExtendedMetadata);
});
```

### Execute Report

#### Execute Synchronously 

By calling `Analytics-Report#execute(options)`, the report is exected in Salesforce, and returns executed result synchronously.
Please refer to Analytics API document about the format of retruning result.

```javascript
/* @interactive */
// get report reference
var reportId = '00O10000000pUw2EAE';
var report = conn.analytics.report(reportId);

// execute report synchronously
report.execute(function(err, result) {
  if (err) { return console.error(err); }
  console.log(result.reportMetadata);
  console.log(result.factMap);
  console.log(result.factMap["T!T"]);
  console.log(result.factMap["T!T"].aggregates);
  // ...
});
```

#### Include Detail Rows in Execution

Setting `details` to true in `options`, it returns execution result with detail rows.

```javascript
/* @interactive */
// execute report synchronously with details option,
// to get detail rows in execution result.
var reportId = '00O10000000pUw2EAE';
var report = conn.analytics.report(reportId);
report.execute({ details: true }, function(err, result) {
  if (err) { return console.error(err); }
  console.log(result.reportMetadata);
  console.log(result.factMap);
  console.log(result.factMap["T!T"]);
  console.log(result.factMap["T!T"].aggregates);
  console.log(result.factMap["T!T"].rows); // <= detail rows in array
  // ...
});
```

#### Override Report Metadata in Execution

You can override report behavior by putting `metadata` object in `options`.
For example, following code shows how to update filtering conditions of a report on demand.

```javascript
/* @interactive */
// overriding report metadata
var metadata = { 
  reportMetadata : {
    reportFilters : [{
      column: 'COMPANY',
      operator: 'contains',
      value: ',Inc.'
    }]
  }
};
// execute report synchronously with overridden filters.
var reportId = '00O10000000pUw2EAE';
var report = conn.analytics.report(reportId);
report.execute({ metadata : metadata }, function(err, result) {
  if (err) { return console.error(err); }
  console.log(result.reportMetadata);
  console.log(result.reportMetadata.reportFilters.length); // <= 1
  console.log(result.reportMetadata.reportFilters[0].column); // <= 'COMPANY' 
  console.log(result.reportMetadata.reportFilters[0].operator); // <= 'contains' 
  console.log(result.reportMetadata.reportFilters[0].value); // <= ',Inc.' 
  // ...
});
```

#### Execute Asynchronously

`Analytics-Report#executeAsync(options)` executes the report asynchronously in Salesforce,
registering an instance to the report to lookup the executed result in future.

```javascript
/* @interactive */
var instanceId;

// execute report asynchronously
var reportId = '00O10000000pUw2EAE';
var report = conn.analytics.report(reportId);
report.executeAsync({ details: true }, function(err, instance) {
  if (err) { return console.error(err); }
  console.log(instance.id); // <= registered report instance id
  instanceId = instance.id;
  // ...
});
```

Afterward use `Analytics-Report#instance(instanceId)`
and call `Analytics-ReportInstance#retrieve()` to get the executed result.

```javascript
/* @interactive */
// retrieve asynchronously executed result afterward.
report.instance(instanceId).retrieve(function(err, result) {
  if (err) { return console.error(err); }
  console.log(result.reportMetadata);
  console.log(result.factMap);
  console.log(result.factMap["T!T"]);
  console.log(result.factMap["T!T"].aggregates);
  console.log(result.factMap["T!T"].rows);
  // ...
});
```

