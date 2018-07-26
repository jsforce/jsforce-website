---
layout: default
headline: blog/headline
contentTemplate: blog/post
category: blog
title: JSforce 1.9 and Its Change on Multi-Record CRUD Operation
date: 2018-07-26
author:
  name: Shinichi Tomita
  url: https://github.com/stomita
---

JSforce version 1.9.0 is now released, which includes several enhancements, but the most big one is the enhancement of multi-record CRUD operation.

Even in prior versions you can of course create/retrieve/update/delete multiple records in one call, using `SObject#create(records)`, `SObject#retrieve(ids)`, `SObject#update(records)`, or `SObject#destroy(ids)`.
But its internal implementation was a little pity - each of input records were mapped to REST API request and called in parallel.
As a result, this CRUD call eagerly consumed API quota, so it was not suitable to use when the num of records exceeds certain amount.
The connection option `maxRequest` parameter (default value is 10) was introduced in order not to make excessive concurrent calls.

There is another way to modify multiple records - Bulk API.
The Bulk API is primary used to modify massive records in asynchronous, so polling is required to get the result.
That is, you cannot get the result so quick, even when the num of the records is not so big (e.g. 50 - 100).

In API ver 42.0, [composite resources for SObject collection](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_composite_sobjects_collections.htm) is introduced.
This API enables you to create/update/delete multiple records in one network call.

Now JSforce 1.9 supports this feature by replacing existing `create()`/`retrieve()`/`update()`/`delete()` calls from previous parallel API requests.


## Changes

If you're already using JSforce's multi-record CRUD in your code, you should care about the following things before upgrading to 1.9.

### "All or None" behavior

Before the ver 1.9, JSforce's multi record CRUD call is not returning any results and throw error when one of the records has failure.
This is usually not expected behavior, and surely expected to return each records' success/failure status as result.
We changed this behavior from 1.9.

Also, we introduced the option to set `allOrNone` for each CRUD calls.
When the `allOrNone` is set to true, the call will raise error when any of the record includes failure, and all modifications are rolled back.

```javascript
const accounts = [
  { Name: 'ABC, Inc.' },
  { Name: 'DEF, Inc.' },
  ...
];
conn.sobject('Account')
  .create(accounts, { allOrNone: true })
  .then((rets) => {
    // All accounts are successfully inserted
    for (const ret of rets) {
      assert(ret.success === true);
    }
  })
  .catch((err) => {
    // some of the records failed in insertion
  });
```

### Parallel Call Fallback

When you explicitly set an API version before 42.0 in connection option, the multi CRUD calls will fall back to parallel call previously used.
You cannot use any feature of collection API, but it will work as same as before.

```javascript
// Explicitly specify the API version in option
const conn = new jsforce.Connection({ version: '39.0' });
///
const accounts = [
  { Name: 'ABC, Inc.' },
  { Name: 'DEF, Inc.' },
  ...
];
// Falls back to parallel call
conn.sobject('Account')
  .create(accounts)
  .then((rets) => {
    // 
  });
```

### `maxRequest` connection option

The `maxRequest` connection option will not be used anymore for `create()`/`update()`/`destroy()` calls, but `upsert()` still checks this value as there is no collection API for upsert.
It will also be checked if you set API version prior to 42.0.


## Update/Destroy Queried Records

One of the coolest feature of JSforce is "query-update/destroy".
By using `Query#update()` or `Query#destroy()` you can easily apply modification to the queried target.

Previously this is sololy using the Bulk API to update/destroy the queried result, but now it becomes hybrid.
It uses SObject Collection API for small amount of records, and when the queried result exceeds the threshold, switches to Bulk API.
These behavior can be modified by passing options like `useBulk` or `bulkThreshold`.

```javascript
conn.sobject('Account')
  .find({ CreatedDate: jsforce.Date.TODAY })
  .destroy({
    useBulk: false, // always use SObject Collection API
    bulkThreshold: 200, // when the num of queried records exceeds this threshold, switch to Bulk API
  })
  .then((rets) => {
    // destroyed results are returned
    for (const ret of rets) {
      console.log(`id: ${ret.id}, success: ${ret.success}`);
    }
  });
```

## Recursive operation

There is a limit of the SObject collection API - up to 200 records can be processed in one-time call.
So if you want to process more than 200 records you may divide the request to process them.

The multi-record CRUD has the feature to automatically divide the input and recursively call SObject Collection API until the given records are all processed.
In order to enable this you have to pass the option `allowRecursive` to CRUD call.


```javascript
// Create 1000 accounts, more than SObject Collection limit (200)
const accounts = [];
for (let i = 0; i < 1000; i++) {
  accounts.push({ Name: `Account #${String(i+1)}` },
}
// Internally dividing records in chunks,
// and recursively sending requests to SObject Collection API
conn.sobject('Account')
  .create(accounts, { allowRecursive: true })
  .then((rets) => {
    assert(rets.length === 1000);
  });
```
