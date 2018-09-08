---
---

## CRUD

JSforce supports basic "CRUD" operation for records in Salesforce.
It also supports multiple record manipulation in one API call.


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

If you are deleting multiple records in one call, you can pass an option in second argument, which includes `allOrNone` flag.
When the `allOrNone` is set to true, the call will raise error when any of the record includes failure,
and all modifications are rolled back (Default is false).

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

Unlike other CRUD calls, upsert with `allOrNone` option will not 

```javascript
/* @interactive */
// Multiple record upsert
conn.sobject("UpsertTable__c").upsert([
 { Name : 'Record #1', ExtId__c : 'ID-0000001' },
 { Name : 'Record #2', ExtId__c : 'ID-0000002' }
],
'ExtId__c',
{ allOrNone: true },
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

### Operation for Multiple Records

From ver 1.9, CRUD operation for multiple records uses [SObject Collection API](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_composite_sobjects_collections.htm) introduced from API 42.0.

If you are using JSforce versions prior to 1.8 or Salesforce API versions prior to 41.0,
it will fall back to parallel execution of CRUD REST API call for each records,
that is, it consumes one API request per record. Be careful for the API quota consumption.

### Operation Options

#### All or None Option

If you are creating multiple records in one call, you can pass an option in second argument, which includes `allOrNone` flag.
When the `allOrNone` is set to true, the call will raise error when any of the record includes failure,
and all modifications are rolled back (Default is false).

```javascript
/* @interactive */
// Multiple records update with allOrNone option set to true
conn.sobject("Account").update([
  { Id : '0017000000hOMChAAO', Name : 'Updated Account #1' },
  { Id : '0017000000iKOZTAA4', Name : 'Updated Account #2' }
],
{ allOrNone: true },
function(err, rets) {
  if (err) { return console.error(err); } // all record update error will be cached here
  for (var i=0; i < rets.length; i++) {
    if (rets[i].success) {
      console.log("Updated Successfully : " + rets[i].id);
    }
  }
});
```

The `allOrNone` option is passed as a parameter to SObject Collection API.
In the environment where the API is not available (e.g. using API versions prior to 42.0),
it raises an error but not treating the roll back of successful modifications.

#### Recursive Option

There is a limit of the SObject collection API - up to 200 records can be processed in one-time call.
So if you want to process more than 200 records you may divide the request to process them.

The multi-record CRUD has the feature to automatically divide the input and recursively call SObject Collection API
until the given records are all processed.
In order to enable this you have to pass the option `allowRecursive` to the CRUD calls.

```javascript
/* @interactive */
// Create 1000 accounts, more than SObject Collection limit (200)
var accounts = [];
for (var i=0; i<1000; i++) {
  accounts.push({ Name: 'Account #' + (i+1) });
}
// Internally dividing records in chunks,
// and recursively sending requests to SObject Collection API
conn.sobject('Account')
  .create(
    accounts,
    { allowRecursive: true },
    function(err, rets) {
      if (err) { return console.error(err); }
      console.log('processed: ' + rets.length);
    }
  );
```

### Update / Delete Queried Records

If you want to update / delete records in Salesforce which match specified condition in bulk,
now you don't have to write a code which download & upload records information.
`Query#update(mapping)` / `Query#destroy()` will directly manipulate records.

```javascript
/* @interactive */
// DELETE FROM Account WHERE CreatedDate = TODAY
conn.sobject('Account')
    .find({ CreatedDate : jsforce.Date.TODAY })
    .destroy(function(err, rets) {
      if (err) { return console.error(err); }
      console.log(rets);
      // ...
    });
```

```javascript
/* @interactive */
// UPDATE Opportunity
// SET CloseDate = '2013-08-31'
// WHERE Account.Name = 'Salesforce.com'
conn.sobject('Opportunity')
    .find({ 'Account.Name' : 'Salesforce.com' })
    .update({ CloseDate: '2013-08-31' }, function(err, rets) {
      if (err) { return console.error(err); }
      console.log(rets);
      // ...
    });
```

In `Query#update(mapping)`, you can include simple templating notation in mapping record.

```javascript
/* @interactive */
//
// UPDATE Task
// SET Description = CONCATENATE(Subject || ' ' || Status)
// WHERE ActivityDate = TODAY
//
conn.sobject('Task')
    .find({ ActivityDate : jsforce.Date.TODAY })
    .update({ Description: '${Subject}  ${Status}' }, function(err, rets) {
      if (err) { return console.error(err); }
      console.log(rets);
      // ...
    });
```

To achieve further complex mapping, `Query#update(mapping)` accepts mapping function in `mapping` argument.

```javascript
/* @interactive */
conn.sobject('Task')
    .find({ ActivityDate : jsforce.Date.TODAY })
    .update(function(rec) {
      return {
        Description: rec.Subject + ' ' + rec.Status
      }
    }, function(err, rets) {
      if (err) { return console.error(err); }
      console.log(rets);
      // ...
    });
```

If you are creating query object from SOQL by using `Connection#query(soql)`,
the bulk delete/update operation cannot be achieved because no sobject type information available initially.
You can avoid it by passing optional argument `sobjectType` in `Query#destroy(sobjectType)` or `Query#update(mapping, sobjectType)`.

```javascript
/* @interactive */
conn.query("SELECT Id FROM Account WHERE CreatedDate = TODAY")
    .destroy('Account', function(err, rets) {
      if (err) { return console.error(err); }
      console.log(rets);
      // ...
    });
```

```javascript
/* @interactive */
conn.query("SELECT Id FROM Task WHERE ActivityDate = TODAY")
    .update({ Description: '${Subject}  ${Status}' }, 'Task', function(err, rets) {
      if (err) { return console.error(err); }
      console.log(rets);
      // ...
    });
```

NOTE: You should be careful when using this feature not to break/lose existing data in Salesforce.
Careful testing is recommended before applying the code to your production environment.


