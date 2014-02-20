---
---

## CRUD

JSforce supports basic "CRUD" operation for records in Salesforce.
It also supports multiple record manipulation, but it consumes one API request per record.
Be careful for the API quota consumption.

### Retrieve

`SObject#retrieve(id)` fetches a record or records specified by id(s) in first argument.

```javascript
/* @interactive */
// Single record retrieval
conn.sobject("Account").retrieve("0017000000hOMChAAO", function(err, account) {
  if (err) { return console.error(err); }
  console.log("Name : " + account.Name);
  // ...
});
```

```javascript
/* @interactive */
// Multiple record retrieval
conn.sobject("Account").retrieve([
  "0017000000hOMChAAO",
  "0017000000iKOZTAA4"
], function(err, accounts) {
  if (err) { return console.error(err); }
  for (var i=0; i < accounts.length; i++) {
    console.log("Name : " + accounts[i].Name);
  }
  // ...
});
```

### Create 

`SObject#create(record)` (or its synonym `SObject#insert(record)`) creates a record or records given in first argument.

```javascript
/* @interactive */
// Single record creation
conn.sobject("Account").create({ Name : 'My Account #1' }, function(err, ret) {
  if (err || !ret.success) { return console.error(err, ret); }
  console.log("Created record id : " + ret.id);
  // ...
});
```

```javascript
/* @interactive */
// Multiple records creation
conn.sobject("Account").create([
  { Name : 'My Account #1' },
  { Name : 'My Account #2' }
],
function(err, rets) {
  if (err) { return console.error(err); }
  for (var i=0; i < rets.length; i++) {
    if (rets[i].success) {
      console.log("Created record id : " + rets[i].id);
    }
  }
  // ...
});
```

### Update

`SObject#update(record)` updates a record or records given in first argument.

```javascript
/* @interactive */
// Single record update
conn.sobject("Account").update({ 
  Id : '0017000000hOMChAAO',
  Name : 'Updated Account #1'
}, function(err, ret) {
  if (err || !ret.success) { return console.error(err, ret); }
  console.log('Updated Successfully : ' + ret.id);
  // ...
});
```

```javascript
/* @interactive */
// Multiple records update
conn.sobject("Account").update([
  { Id : '0017000000hOMChAAO', Name : 'Updated Account #1' },
  { Id : '0017000000iKOZTAA4', Name : 'Updated Account #2' }
],
function(err, rets) {
  if (err) { return console.error(err); }
  for (var i=0; i < rets.length; i++) {
    if (rets[i].success) {
      console.log("Updated Successfully : " + rets[i].id);
    }
  }
});
```

### Delete

`SObject#destroy(id)` (or its synonym `SObject#del(id)`, `SObject#delete(id)`) deletes a record or records given in first argument.

```javascript
/* @interactive */
// Single record deletion
conn.sobject("Account").destroy('0017000000hOMChAAO', function(err, ret) {
  if (err || !ret.success) { return console.error(err, ret); }
  console.log('Deleted Successfully : ' + ret.id);
});
```


```javascript
/* @interactive */
// Multiple records deletion
conn.sobject("Account").del([ // synonym of "destroy"
  '0017000000hOMChAAO',
  '0017000000iKOZTAA4'
], 
function(err, rets) {
  if (err) { return console.error(err); }
  for (var i=0; i < rets.length; i++) {
    if (rets[i].success) {
      console.log("Deleted Successfully : " + rets[i].id);
    }
  }
});
```

### Upsert

`SObject#upsert(record, extIdField)` will upsert a record or records given in first argument. External ID field name must be specified in second argument.


```javascript
/* @interactive */
// Single record upsert
conn.sobject("UpsertTable__c").upsert({ 
  Name : 'Record #1',
  ExtId__c : 'ID-0000001'
}, 'ExtId__c', function(err, ret) {
  if (err || !ret.success) { return console.error(err, ret); }
  console.log('Upserted Successfully');
  // ...
});
```


```javascript
/* @interactive */
// Multiple record upsert
conn.sobject("UpsertTable__c").upsert([
 { Name : 'Record #1', ExtId__c : 'ID-0000001' },
 { Name : 'Record #2', ExtId__c : 'ID-0000002' }
],
'ExtId__c',
function(err, rets) {
  if (err) { return console.error(err); }
  for (var i=0; i < rets.length; i++) {
    if (rets[i].success) {
      console.log("Upserted Successfully");
    }
  }
  // ...
});
```


