---
---

## Metadata API

### Describe Metadata

`Metadata#describe(version)` is the method to list all metadata in an org.

```javascript
/* @interactive */
conn.metadata.describe('39.0', function(err, metadata) {
  if (err) { return console.error('err', err); }
  for (var i=0; i < metadata.length; i++) {
    var meta = metadata[i];
    console.log("organizationNamespace: " + meta.organizationNamespace);
    console.log("partialSaveAllowed: " + meta.partialSaveAllowed);
    console.log("testRequired: " + meta.testRequired);
    console.log("metadataObjects count: " + metadataObjects.length);
  }
});
```
### List Metadata

`Metadata#list(types, version)` is the method to list summary information for all metadata types.

```javascript
/* @interactive */
var types = [{type: 'CustomObject', folder: null}];
conn.metadata.list(types, '39.0', function(err, metadata) {
  if (err) { return console.error('err', err); }
    var meta = metadata[0];
    console.log('metadata count: ' + metadata.length);
    console.log('createdById: ' + meta.createdById);
    console.log('createdByName: ' + meta.createdByName);
    console.log('createdDate: ' + meta.createdDate);
    console.log('fileName: ' + meta.fileName);
    console.log('fullName: ' + meta.fullName);
    console.log('id: ' + meta.id);
    console.log('lastModifiedById: ' + meta.lastModifiedById);
    console.log('lastModifiedByName: ' + meta.lastModifiedByName);
    console.log('lastModifiedDate: ' + meta.lastModifiedDate);
    console.log('manageableState: ' + meta.manageableState);
    console.log('namespacePrefix: ' + meta.namespacePrefix);
    console.log('type: ' + meta.type);
});
```

### Read Metadata

`Metadata#read(type, fullNames)` is the method to retrieve metadata information which are specified by given names.

```javascript
/* @interactive */
var fullNames = [ 'Account', 'Contact' ];
conn.metadata.read('CustomObject', fullNames, function(err, metadata) {
  if (err) { console.error(err); }
  for (var i=0; i < metadata.length; i++) {
    var meta = metadata[i];
    console.log("Full Name: " + meta.fullName);
    console.log("Fields count: " + meta.fields.length);
    console.log("Sharing Model: " + meta.sharingModel);
  }
});
```



### Create Metadata

To create new metadata objects, use `Metadata#create(type, metadata)`.
Metadata format for each metadata types are written in the Salesforce Metadata API document.

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
conn.metadata.create('CustomObject', metadata, function(err, results) {
  if (err) { console.err(err); }
  for (var i=0; i < results.length; i++) {
    var result = results[i];
    console.log('success ? : ' + result.success);
    console.log('fullName : ' + result.fullName);
  }
});
```

There is an alternative method to create metadata, in aynchronous - `Metadata#createAync()`.

This asynchronous version is different from synchronous one - it returns asynchronous result ids with current statuses,
which can be used for later execution status query.

NOTE: This API is depricated from Salesforce as of API version 31.0 in favor of the synchronous version of the call

```javascript
// request creating metadata and receive execution ids & statuses
var asyncResultIds = [];
conn.metadata.createAsync('CustomObject', metadata, function(err, results) {
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
returned from `Metadata#createAsync()` call.

```javascript
conn.metadata.createAsync('CustomObject', metadata).complete(function(err, results) {
  if (err) { console.err(err); }
  console.log(results);
});
````

NOTE: In version 1.2.x, `Metadata#create()` method was an alias of `Metadata#createAsync()`.

From ver 1.3, the method has been changed to point to synchronous call `Metadata#createSync()` which is corresponding to the sync API newly introduced from API 30.0. This is due to the removal of asynchronous metadata call from API 31.0.

Asynchronous method `Metadata#createAsync()` still works if API version is specified to less than 31.0, but not recommended for active usage.


### Update Metadata

`Metadata#update(type, updateMetadata)` can be used for updating existing metadata objects.

```
/* @interactive */
var metadata = [{
  fullName: 'TestObject1__c.AutoNumberField__c',
  label: 'Auto Number #2',
  length: 50
}]
conn.metadata.update('CustomField', metadata, function(err, results) {
  if (err) { console.error(err); }
  for (var i=0; i < results.length; i++) {
    var result = results[i];
    console.log('success ? : ' + result.success);
    console.log('fullName : ' + result.fullName);
  }
});
```

NOTE: In version 1.2.x, `Metadata#update()` method was an alias of `Metadata#updateAsync()`.

From ver 1.3, the method has been changed to point to synchronous call `Metadata#updateSync()` which is corresponding to the sync API newly introduced from API 30.0. This is due to the removal of asynchronous metadata call from API 31.0.

Asynchronous method `Metadata#updateAsync()` still works if API version is specified to less than 31.0, but not recommended for active usage.


### Upsert Metadata

`Metadata#upsert(type, metadata)` is used for upserting metadata - insert new metadata when it is not available, otherwise update it.

```javascript
/* @interactive */
var metadata = [{
  fullName: 'TestObject2__c',
  label: 'Upserted Object 2',
  pluralLabel: 'Upserted Object 2',
  nameField: {
    type: 'Text',
    label: 'Test Object Name'
  },
  deploymentStatus: 'Deployed',
  sharingModel: 'ReadWrite'
}, {
  fullName: 'TestObject__c',
  label: 'Upserted Object 3',
  pluralLabel: 'Upserted Object 3',
  nameField: {
    type: 'Text',
    label: 'Test Object Name'
  },
  deploymentStatus: 'Deployed',
  sharingModel: 'ReadWrite'
}];
conn.metadata.upsert('CustomObject', metadata, function(err, results) {
  if (err) { console.error(err); }
  for (var i=0; i < results.length; i++) {
    var result = results[i];
    console.log('success ? : ' + result.success);
    console.log('created ? : ' + result.created);
    console.log('fullName : ' + result.fullName);
  }
});
```


### Rename Metadata

`Metadata#rename(type, oldFullName, newFullName)` is used for renaming metadata.

```javascript
/* @interactive */
conn.metadata.rename('CustomObject', 'TestObject3__c', 'UpdatedTestObject3__c', function(err, result) {
  if (err) { console.error(err); }
  for (var i=0; i < results.length; i++) {
    var result = results[i];
    console.log('success ? : ' + result.success);
    console.log('fullName : ' + result.fullName);
  }
});
```


### Delete Metadata

`Metadata#delete(type, metadata)` can be used for deleting existing metadata objects.

```javascript
/* @interactive */
var fullNames = ['TestObject1__c', 'TestObject2__c'];
conn.metadata.delete('CustomObject', fullNames, function(err, results) {
  if (err) { console.error(err); }
  for (var i=0; i < results.length; i++) {
    var result = results[i];
    console.log('success ? : ' + result.success);
    console.log('fullName : ' + result.fullName);
  }
});
```

NOTE: In version 1.2.x, `Metadata#delete()` method was an alias of `Metadata#deleteAsync()`.

From ver 1.3, the method has been changed to point to synchronous call `Metadata#deleteSync()` which is corresponding to the sync API newly introduced from API 30.0. This is due to the removal of asynchronous metadata call from API 31.0.

Asynchronous method `Metadata#deleteAsync()` still works if API version is specified to less than 31.0, but not recommended for active usage.


### Retrieve / Deploy Metadata (File-based)

You can retrieve metadata information which is currently registered in Salesforce,
`Metadata#retrieve(options)` command can be used.

The structure of hash object argument `options` is same to the message object defined in Salesforce Metadata API.

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



