---
---

## Metadata API

### Create Metadata

To newly create metadata objects, use `Metadata#create(type, metadata)`.
Metadata format for each metadata types are written in Metadata API document.

By default it returns asynchronous result ids with current statuses,
which can be used for later execution status query.

```javascript
/* @interactive */
// creating metadata in array
var metadata = [{
  fullName: 'TestObject1__c',
  label: 'Test Object 1',
  pluralLabel: 'Test Object 1',
  nameField: {
    type: 'Text',
    label: 'Test Object Name'
  },
  deploymentStatus: 'Deployed',
  sharingModel: 'ReadWrite'
}, {
  fullName: 'TestObject2__c',
  label: 'Test Object 2',
  pluralLabel: 'Test Object 2',
  nameField: {
    type: 'AutoNumber',
    label: 'Test Object #'
  },
  deploymentStatus: 'InDevelopment',
  sharingModel: 'Private'
}];

// request creating metadata and receive execution ids & statuses
var asyncResultIds = [];
conn.metadata.create('CustomObject', metadata, function(err, results) {
  if (err) { console.err(err); }
  for (var i=0; i < results.length; i++) {
    var result = results[i];
    console.log('id: ' + result.id);
    console.log('done ? : ' + result.done);
    console.log('state : ' + result.state); console.log(results);
    // save for later status check 
    asyncResultIds.push(result.id);
  }
});

```

And then you can check creation statuses by `Metadata#checkStatus(asyncResultIds)`,
and wait their completion by calling `Metadata-AsyncResultLocator#complete()` for returned object.

```javascript
/* @interactive */
conn.metadata.checkStatus(asyncResultIds).complete(function(err, results) {
  if (err) { console.error(err); }
  for (var i=0; i < results.length; i++) {
    var result = results[i];
    console.log('id: ' + result.id);
    console.log('done ? : ' + result.done);
    console.log('state : ' + result.state);
  }
});
```

Or you can directly apply `Metadata-AsyncResultLocator#complete()` call for the locator object
returned from `Metadata#create()` call.

```javascript
/* @interactive */
conn.metadata.create('CustomObject', metadata).complete(function(err, results) {
  if (err) { console.err(err); }
  console.log(results); 
});
````

### Update Metadata

`Metadata#update(type, updateMetadata)` can be used for updating existing metadata objects.

```
/* @interactive */
var updateMetadata = [{
  currentName: 'TestObject1__c.AutoNumberField__c',
  metadata: {
    type: 'Text',
    fullName: 'TestObject2__c.AutoNumberField2__c',
    label: 'Auto Number #2',
    length: 50
  }
}];
conn.metadata.update('CustomField', updateMetadata).complete(function(err, results) {
  if (err) { console.error(err); }
  for (var i=0; i < results.length; i++) {
    var result = results[i];
    console.log('id: ' + result.id);
    console.log('done ? : ' + result.done);
    console.log('state : ' + result.state);
  }
});
```

### Delete Metadata

`Metadata#delete(type, updateMetadata)` (or its synonym of `Metadata#del()`)
can be used for deleting existing metadata objects.

```javascript
/* @interactive */
var metadata = [{
  fullName: 'TestObject1__c',
}, {
  fullName: 'TestObject2__c',
}];
conn.metadata.delete('CustomObject', metadata).complete(function(err, results) {
  if (err) { console.error(err); }
  for (var i=0; i < results.length; i++) {
    var result = results[i];
    console.log('id: ' + result.id);
    console.log('done ? : ' + result.done);
    console.log('state : ' + result.state);
  }
});
```

### Retrieve / Deploy Metadata (File-based)

You can retrieve metadata information which is currently registered in Salesforce,
`Metadata#retrieve(options)` command can be used.

```javascript
var fs = require('fs');
conn.metadata.retrieve({ packageNames: [ 'My Test Package' ] })
             .stream().pipe(fs.createWriteStream("./path/to/MyPackage.zip"));
```

If you have metadata definition files in your file system, create zip file from them 
and call `Metadata#deploy(zipIn, options)` to deploy all of them.

```javascript
var fs = require('fs');
var zipStream = fs.createReadStream("./path/to/MyPackage.zip");
conn.metadata.deploy(zipStream, { runTests: [ 'MyApexTriggerTest' ] })
  .complete(function(err, result) {
    if (err) { console.error(err); }
    console.log('done ? :' + result.done);
    console.log('success ? : ' + result.true);
    console.log('state : ' + result.state);
    console.log('component errors: ' + result.numberComponentErrors);
    console.log('components deployed: ' + result.numberComponentsDeployed);
    console.log('tests completed: ' + result.numberTestsCompleted);
  });
```



