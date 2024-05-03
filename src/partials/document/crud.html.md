---
---

## CRUD

JSforce supports basic "CRUD" operation for records in Salesforce.
It also supports multiple record manipulation in one API call.


### Retrieve

`SObject.retrieve(id)` fetches a record or records specified by id(s) in first argument.

```javascript
/* @interactive */
// Single record retrieval
const account = await conn.sobject('Account').retrieve('0010500000fxR4EAAU')
console.log(`Name: ${account.Name}`)
```

```javascript
/* @interactive */
// Multiple record retrieval
const accounts = await conn.sobject('Account').retrieve([
  '0010500000fxR4EAAU',
  '0010500000fxR3nAAE',
])

for (const acc of accounts) {
  console.log(`Name: ${acc.Name}`)
}
```

### Create 

`SObject.create(record)` (or its synonym `SObject.insert(record)`) creates a record or records given in first argument.

```javascript
/* @interactive */
// Single record creation
const ret = await conn.sobject("Account").create({ Name : 'My Account #1' });
console.log(`Created record id : ${ret.id}`);
```

```javascript
/* @interactive */
// Multiple records creation
const rets = await conn.sobject("Account").create([
  { Name : 'My Account #2' },
  { Name : 'My Account #3' },
]);

for (const ret of rets) {
  console.log(`Created record id : ${ret.id}`);
}
```

### Update

`SObject.update(record)` updates a record or records given in first argument.

```javascript
/* @interactive */
// Single record update
const ret = await conn.sobject("Account").update({
  Id: '0010500000fxbcuAAA',
  Name : 'Updated Account #1'
})

if (ret.success) {
  console.log(`Updated Successfully : ${ret.id}`);
}
```

```javascript
/* @interactive */
// Multiple records update
const rets = await conn.sobject("Account").update([
  { Id: '0010500000fxbcuAAA', Name : 'Updated Account #1' },
  { Id: '0010500000fxbcvAAA', Name : 'Updated Account #2' },
])

for (const ret of rets) {
  if (ret.success) {
    console.log(`Updated Successfully : ${ret.id}`);
  }
}
```

### Delete

`SObject.destroy(id)` (or its synonym `SObject.del(id)`, `SObject.delete(id)`) deletes a record or records given in first argument.

```javascript
/* @interactive */
// Single record deletion
const ret = await conn.sobject("Account").delete('0010500000fxbcuAAA')
                                                                       
if (ret.success) {
  console.log(`Deleted Successfully : ${ret.id}`);
}
```

If you are deleting multiple records in one call, you can pass an option in second argument, which includes `allOrNone` flag.
When the `allOrNone` is set to true (default: `false`), the call will raise error when any of the record fails to be deleted and all modifications are rolled back.

```javascript
/* @interactive */
// Multiple records deletion
const rets = await conn.sobject("Account").delete([
  '0010500000fxR1EAAU',
  '0010500000fxR1FAAU'
])
                                                     
for (const ret of rets) {
  if (ret.success) {
    console.log(`Deleted Successfully : ${ret.id}`);
  }
}
```

### Upsert

`SObject.upsert(record, extIdField)` will upsert a record or records given in first argument. External ID field name must be specified in second argument.


```javascript
/* @interactive */
// Single record upsert
const ret = await conn.sobject("UpsertTable__c").upsert({ 
  Name : 'Record #1',
  ExtId__c : 'ID-0000001'
}, 'ExtId__c');

if (ret.success) {
  console.log(`Upserted Successfully : ${ret.id}`);
}
```

Unlike other CRUD calls, upsert with `allOrNone` option will not revert successfull upserts in case one or more fails.

```javascript
/* @interactive */
// Multiple record upsert
const rets = await conn.sobject("UpsertTable__c").upsert([
 { Name : 'Record #1', ExtId__c : 'ID-0000001' },
 { Name : 'Record #2', ExtId__c : 'ID-0000002' }
],
'ExtId__c',
{ allOrNone: true });

for (const ret of rets) {
  if (ret.success) {
    console.log("Upserted Successfully");
  }
};
```

### Operation for Multiple Records

From ver 1.9, CRUD operation for multiple records uses [SObject Collection API](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_composite_sobjects_collections.htm) introduced in API 42.0.

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
const rets = await conn.sobject("account").update([
  { Id: '0010500000fxR1IAAU', name : 'updated account #1' },
  { Id: '0010500001fxR1IAAU', name : 'updated account #1' },
])
                                                             
for (const ret of rets) {
  if (ret.errors.length > 0) {
    console.error(ret.errors) // record update error(s)
  }
  if (ret.success) {
    console.log(`updated successfully : ${ret.id}`);
  } 
}
```

The `allOrNone` option is passed as a parameter to the SObject Collection API.
If the API is not available (e.g. using API versions prior to 42.0),
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
const accounts = [];
for (let i=0; i<1000; i++) {
  accounts.push({ Name: 'Account #' + (i+1) });
}
// Internally dividing records in chunks,
// and recursively sending requests to SObject Collection API
const rets = await conn.sobject('Account')
  .create(
    accounts,
    { allowRecursive: true }
  );
console.log('processed: ' + rets.length);
```

### Update / Delete Queried Records

If you want to update/delete records in Salesforce that match a specific condition in bulk,
`Query.update(mapping)` / `Query.destroy()` allows to use the Bulk/Bulk V2 API.

```javascript
/* @interactive */
// DELETE FROM Account WHERE CreatedDate = TODAY

// will use Bulk (V1) API if query returns more than the default bulk threshold (200)
const rets = await conn.sobject('Account')
  .find({ CreatedDate : jsforce.Date.TODAY })
  .destroy();

console.log(rets)
```

```javascript
/* @interactive */
const rets = await conn.sobject('Account')
  .find({ CreatedDate : jsforce.Date.TODAY })
  .destroy({
    allowBulk: true, // disable Bulk API, use SObject REST API
    bulkThreshold: 100, // record threshold
    bulkApiVersion: 2 // use Bulk V2 API (default: 1)
    });

console.log(rets)
```

```javascript
/* @interactive */
// UPDATE Opportunity
// SET CloseDate = '2013-08-31'
// WHERE Account.Name = 'Salesforce.com'
const rets = await conn.sobject('Opportunity')
    .find({ 'Account.Name' : 'Salesforce.com' })
    .update({ CloseDate: '2013-08-31' });
console.log(rets);
```

In `Query.update(mapping)`, you can include simple templating notation in mapping record.

```javascript
/* @interactive */
//
// UPDATE Task
// SET Description = CONCATENATE(Subject || ' ' || Status)
// WHERE ActivityDate = TODAY
//
const rets = await conn.sobject('Task')
  .find({ ActivityDate : jsforce.Date.TODAY })
  .update({ Description: '${Subject}  ${Status}' });
console.log(rets)
```

To achieve further complex mapping, `Query.update(mapping)` accepts a mapping function as an argument.

```javascript
/* @interactive */
const rets = await conn.sobject('Task')
  .find({ ActivityDate : jsforce.Date.TODAY })
  .update((rec) => {
    return {
      Description: rec.Subject + ' ' + rec.Status
    }
  });
console.log(rets);
```

If you are creating a query object from SOQL by using `Connection.query(soql)`,
the bulk delete/update operation cannot be achieved because no sobject type information is available initially.
You can avoid this by passing the `sobjectType` argument to `Query.destroy(sobjectType)` or `Query.update(mapping, sobjectType)`.

```javascript
/* @interactive */
const rets = await conn.query("SELECT Id FROM Account WHERE CreatedDate = TODAY").destroy('Account');
console.log(rets);
```

```javascript
/* @interactive */
const rets = await conn.query("SELECT Id FROM Task WHERE ActivityDate = TODAY").update({ Description: '${Subject}  ${Status}' }, 'Task');
console.log(rets);
```

NOTE: You should be careful when using this feature not to break/lose existing data in Salesforce.
Careful testing is recommended before applying the code to your production environment.


