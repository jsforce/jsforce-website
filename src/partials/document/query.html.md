---
---

## Query

### Using SOQL

By using `Connection#query(soql)`, you can achieve very basic SOQL query to fetch Salesforce records.

```javascript
/* @interactive */
var records = [];
conn.query("SELECT Id, Name FROM Account", function(err, result) {
  if (err) { return console.error(err); }
  console.log("total : " + result.totalSize);
  console.log("fetched : " + result.records.length);
});
```

#### Callback Style

There are two ways to retrieve the result records.

As we have seen above, our package provides widely-used callback style API call for query execution. It returns one API call result in its callback.

```javascript
/* @interactive */
var records = [];
conn.query("SELECT Id, Name FROM Account", function(err, result) {
  if (err) { return console.error(err); }
  console.log("total : " + result.totalSize);
  console.log("fetched : " + result.records.length);
  console.log("done ? : " + result.done);
  if (!result.done) {
    // you can use the locator to fetch next records set.
    // Connection#queryMore()
    console.log("next records URL : " + result.nextRecordsUrl);
  }
});
```

#### Event-Driven Style

When a query is executed, it emits "record" event for each fetched record. By listening the event you can collect fetched records.

If you want to fetch records exceeding the limit number of returning records per one query, you can use `autoFetch` option in `Query#execute(options)` (or its synonym `Query#exec(options)`, `Query#run(options)`) method. It is recommended to use `maxFetch` option also, if you have no idea how large the query result will become.

When query is completed, `end` event will be fired. The `error` event occurs something wrong when doing query.

```javascript
/* @interactive */
var records = [];
var query = conn.query("SELECT Id, Name FROM Account")
  .on("record", function(record) {
    records.push(record);
  })
  .on("end", function() {
    console.log("total in database : " + query.totalSize);
    console.log("total fetched : " + query.totalFetched);
  })
  .on("error", function(err) {
    console.error(err);
  })
  .run({ autoFetch : true, maxFetch : 4000 }); // synonym of Query#execute();
```

NOTE: When `maxFetch` option is not set, the default value (10,000) is applied. If you really want to fetch more records than the default value, you should explicitly set the maxFetch value in your query.

NOTE: In ver. 1.2 or earlier, the callback style (or promise style) query invokation with `autoFetch` option only returns records in first fetch. From 1.3, it returns all records retrieved up to `maxFetch` value.


### Using Query Method-Chain

#### Basic Method Chaining

By using `SObject#find(conditions, fields)`, you can do query in JSON-based condition expression (like MongoDB). By chaining other query construction methods, you can create a query programatically.

```javascript
/* @interactive */
//
// Following query is equivalent to this SOQL
//
// "SELECT Id, Name, CreatedDate FROM Contact
//  WHERE LastName LIKE 'A%' AND CreatedDate >= YESTERDAY AND Account.Name = 'Sony, Inc.'
//  ORDER BY CreatedDate DESC, Name ASC
//  LIMIT 5 OFFSET 10"
//
conn.sobject("Contact")
  .find(
    // conditions in JSON object
    { LastName : { $like : 'A%' },
      CreatedDate: { $gte : jsforce.Date.YESTERDAY },
      'Account.Name' : 'Sony, Inc.' },
    // fields in JSON object
    { Id: 1,
      Name: 1,
      CreatedDate: 1 }
  )
  .sort({ CreatedDate: -1, Name : 1 })
  .limit(5)
  .skip(10)
  .execute(function(err, records) {
    if (err) { return console.error(err); }
    console.log("fetched : " + records.length);
  });
```

Another representation of the query above.

```javascript
/* @interactive */
conn.sobject("Contact")
  .find({
    LastName : { $like : 'A%' },
    CreatedDate: { $gte : jsforce.Date.YESTERDAY },
    'Account.Name' : 'Sony, Inc.'
  },
    'Id, Name, CreatedDate' // fields can be string of comma-separated field names
                            // or array of field names (e.g. [ 'Id', 'Name', 'CreatedDate' ])
  )
  .sort('-CreatedDate Name') // if "-" is prefixed to field name, considered as descending.
  .limit(5)
  .skip(10)
  .execute(function(err, records) {
    if (err) { return console.error(err); }
    console.log("record length = " + records.length);
    for (var i=0; i<records.length; i++) {
      var record = records[i];
      console.log("Name: " + record.Name);
      console.log("Created Date: " + record.CreatedDate);
    }
  });
```

#### Wildcard Fields

When `fields` argument is omitted in `SObject#find(conditions, fields)` call, it will implicitly describe current SObject fields before the query (lookup cached result first, if available) and then fetch all fields defined in the SObject.

NOTE: In the version less than 0.6, it fetches only `Id` field if `fields` argument is omitted.

```javascript
/* @interactive */
conn.sobject("Contact")
  .find({ CreatedDate: jsforce.Date.TODAY }) // "fields" argument is omitted
  .execute(function(err, records) {
    if (err) { return console.error(err); }
    console.log(records);
  });
```

The above query is equivalent to:

```javascript
/* @interactive */
conn.sobject("Contact")
  .find({ CreatedDate: jsforce.Date.TODAY }, '*') // fields in asterisk, means wildcard.
  .execute(function(err, records) {
    if (err) { return console.error(err); }
    console.log(records);
  });
```


Query can also be represented in more SQL-like verbs - `SObject#select(fields)`, `Query#where(conditions)`, `Query#orderby(sort, dir)`, and `Query#offset(num)`.

```javascript
/* @interactive */
conn.sobject("Contact")
  .select('*, Account.*') // asterisk means all fields in specified level are targeted.
  .where("CreatedDate = TODAY") // conditions in raw SOQL where clause.
  .limit(10)
  .offset(20) // synonym of "skip"
  .execute(function(err, records) {
    for (var i=0; i<records.length; i++) {
      var record = records[i];
      console.log("First Name: " + record.FirstName);
      console.log("Last Name: " + record.LastName);
      // fields in Account relationship are fetched
      console.log("Account Name: " + record.Account.Name); 
    }
  });
```

You can also include child relationship records into query result by calling `Query#include(childRelName)`. After `Query#include(childRelName)` call, it enters into the context of child query. In child query context, query construction call is applied to the child query. Use `SubQuery#end()` to recover from the child context.


```javascript
/* @interactive */
//
// Following query is equivalent to this SOQL
//
// "SELECT Id, FirstName, LastName, ..., 
//         Account.Id, Acount.Name, ...,
//         (SELECT Id, Subject, … FROM Cases
//          WHERE Status = 'New' AND OwnerId = :conn.userInfo.id
//          ORDER BY CreatedDate DESC)
//  FROM Contact
//  WHERE CreatedDate = TODAY
//  LIMIT 10 OFFSET 20"
//
conn.sobject("Contact")
  .select('*, Account.*')
  .include("Cases") // include child relationship records in query result. 
     // after include() call, entering into the context of child query.
     .select("*")
     .where({
        Status: 'New',
        OwnerId : conn.userInfo.id,
     })
     .orderby("CreatedDate", "DESC")
     .end() // be sure to call end() to exit child query context
  .where("CreatedDate = TODAY")
  .limit(10)
  .offset(20)
  .execute(function(err, records) {
    if (err) { return console.error(err); }
    console.log('records length = ' + records.length);
    for (var i=0; i<records.length; i++) {
      var record = records[i];
      console.log("First Name: " + record.FirstName);
      console.log("Last Name: " + record.LastName);
      // fields in Account relationship are fetched
      console.log("Account Name: " + record.Account.Name); 
      // 
      if (record.Cases) {
        console.log("Cases total: " + record.Cases.totalSize);
        console.log("Cases fetched: " + record.Cases.records.length);
      }
    }
  });
```

