---
---

## Metadata API

### Describe Metadata

`Metadata.describe(version)` lists all metadata in an org.

```javascript
/* @interactive */
const metadata = await conn.metadata.describe('60.0')
console.log(`organizationNamespace: ${metadata.organizationNamespace}`);
console.log(`partialSaveAllowed: ${metadata.partialSaveAllowed}`);
console.log(`testRequired: ${metadata.testRequired}`);
console.log(`metadataObjects count: ${metadata.metadataObjects.length}`);
```
### List Metadata

`Metadata.list(types, version)` lists summary information for all metadata types.

```javascript
/* @interactive */
const types = [{type: 'CustomObject', folder: null}];
const metadata = await conn.metadata.list(types, '60.0');
const meta = metadata[0]

console.log(`metadata count: ${metadata.length}`);
console.log(`createdById: ${meta.createdById}`);
console.log(`createdByName: ${meta.createdByName}`);
console.log(`createdDate: ${meta.createdDate}`);
console.log(`fileName: ${meta.fileName}`);
console.log(`fullName: ${meta.fullName}`);
console.log(`id: ${meta.id}`);
console.log(`lastModifiedById: ${meta.lastModifiedById}`);
console.log(`lastModifiedByName: ${meta.lastModifiedByName}`);
console.log(`lastModifiedDate: ${meta.lastModifiedDate}`);
console.log(`manageableState: ${meta.manageableState}`);
console.log(`namespacePrefix: ${meta.namespacePrefix}`);
console.log(`type: ${meta.type}`);
```

### Read Metadata

`Metadata.read(type, fullNames)` retrieves metadata information of a specific types.

```javascript
/* @interactive */
const fullNames = [ 'Account', 'Contact' ];
const metadata = await conn.metadata.read('CustomObject', fullNames);
for (const meta of metadata) {
  console.log(`Full Name: ${meta.fullName}`);
  console.log(`Fields count: ${meta.fields.length}`);
  console.log(`Sharing Model: ${meta.sharingModel}`);
}
```



### Create Metadata

To create new metadata objects, use `Metadata.create(type, metadata)`.
Metadata format for each metadata types are written in the Salesforce Metadata API document.

```javascript
/* @interactive */
// creating metadata in array
const metadata = [{
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
const results = await conn.metadata.create('CustomObject', metadata);
for (const res of results) {
  console.log(`success ? : ${res.success}`);
  console.log(`fullName : ${res.fullName}`);
}
```

And then you can check creation statuses by `Metadata.checkStatus(asyncResultIds)`,
and wait their completion by calling `Metadata-AsyncResultLocator.complete()` for returned object.

```javascript
const results = await conn.metadata.checkStatus(asyncResultIds).complete()

for (const i=0; i < results.length; i++) {
  const result = results[i];
  console.log('id: ' + result.id);
  console.log('done ? : ' + result.done);
  console.log('state : ' + result.state);
}
```

### Update Metadata

`Metadata.update(type, updateMetadata)` can be used for updating existing metadata objects.

```javascript
/* @interactive */
const metadata = [{
  fullName: 'TestObject1__c.AutoNumberField__c',
  label: 'Auto Number #2',
  length: 50
}]
const results = await conn.metadata.update('CustomField', metadata);

for (let i=0; i < results.length; i++) {
  const result = results[i];
  console.log('success ? : ' + result.success);
  console.log('fullName : ' + result.fullName);
}

```

### Upsert Metadata

`Metadata.upsert(type, metadata)` is used for upserting metadata - insert new metadata when it is not available, otherwise update it.

```javascript
/* @interactive */
const metadata = [{
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
const results = await conn.metadata.upsert('CustomObject', metadata);
for (let i=0; i < results.length; i++) {
  const result = results[i];
  console.log('success ? : ' + result.success);
  console.log('created ? : ' + result.created);
  console.log('fullName : ' + result.fullName);
}
```


### Rename Metadata

`Metadata.rename(type, oldFullName, newFullName)` is used for renaming metadata.

```javascript
/* @interactive */
const result = await conn.metadata.rename('CustomObject', 'TestObject3__c', 'UpdatedTestObject3__c');
for (let i=0; i < results.length; i++) {
  const result = results[i];
  console.log('success ? : ' + result.success);
  console.log('fullName : ' + result.fullName);
}
```


### Delete Metadata

`Metadata.delete(type, metadata)` can be used for deleting existing metadata objects.

```javascript
/* @interactive */
const fullNames = ['TestObject1__c', 'TestObject2__c'];
const results = await conn.metadata.delete('CustomObject', fullNames);

for (let i=0; i < results.length; i++) {
  const result = results[i];
  console.log('success ? : ' + result.success);
  console.log('fullName : ' + result.fullName);
}
```

### Retrieve / Deploy Metadata (File-based)

You can retrieve metadata information which is currently registered in Salesforce by calling the `Metadata.retrieve(options)` method.

The structure of hash object argument `options` is same to the message object defined in Salesforce Metadata API.

```javascript
const fs = require('fs');
conn.metadata.retrieve({ packageNames: [ 'My Test Package' ] })
  .stream().pipe(fs.createWriteStream("./path/to/MyPackage.zip"));
```

If you have metadata definition files in your file system, create zip file from them
and call `Metadata.deploy(zipIn, options)` to deploy all of them.


```javascript
const fs = require('fs');
const zipStream = fs.createReadStream("./path/to/MyPackage.zip");
const result = await conn.metadata.deploy(zipStream, { runTests: [ 'MyApexTriggerTest' ] }).complete();
console.log('done ? :' + result.done);
console.log('success ? : ' + result.true);
console.log('state : ' + result.state);
console.log('component errors: ' + result.numberComponentErrors);
console.log('components deployed: ' + result.numberComponentsDeployed);
console.log('tests completed: ' + result.numberTestsCompleted);
```



