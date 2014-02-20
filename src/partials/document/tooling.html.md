---
---

## Tooling API

Tooling API is used to build custom development tools for Salesforce platform,
for example building custom Apex Code / Visualforce page editor.

Tooling API has almost same interface as usual REST API,
so CRUD operation, query, and describe can be done also for these developer objects.

### CRUD to Tooling Objects

You can create/retrieve/update/delete records in tooling objects (e.g. ApexCode, ApexPage).

To get reference of tooling object, use `Tooling#sobject(sobjectType)`.

```javascript
/* @interactive */
var apexBody = [
  "public class TestApex {",
  "  public string sayHello() {",
  "    return 'Hello';",
  "  }",
  "}"
].join('\n');
conn.tooling.sobject('ApexClass').create({
  body: apexBody
}, function(err, res) {
  if (err) { return console.error(err); }
  console.log(res);
});
```

### Query Tooling Objects

Querying records in tooling objects is also supported.
Use `Tooling#query(soql)` or `SObject#find(filters, fields)`.

```javascript
/* @interactive */
conn.tooling.sobject('ApexTrigger')
  .find({ TableEnumOrId: "Lead" })
  .execute(function(err, records) {
    if (err) { return console.error(err); }
    console.log("fetched : " + records.length);
    for (var i=0; i < records.length; i++) {
      var record = records[i];
      console.log('Id: ' + record.Id);
      console.log('Name: ' + record.Name);
    }
  });
```

### Describe Tooling Objects

Describing all tooling objects in the organization is done by calling `Tooling#describeGlobal()`.

```javascript
/* @interactive */
conn.tooling.describeGlobal(function(err, res) {
  if (err) { return console.error(err); }
  console.log('Num of tooling objects : ' + res.sobjects.length);
  // ...
});
```

Describing each object detail is done by calling `SObject#describe()` to tooling object reference,
or just calling `Tooling#describeSObject(sobjectType)`.


```javascript
/* @interactive */
conn.tooling.sobject('ApexPage').describe(function(err, meta) {
  if (err) { return console.error(err); }
  console.log('Label : ' + meta.label);
  console.log('Num of Fields : ' + meta.fields.length);
  // ...
});
```

### Execute Anonymous Apex

You can use Tooling API to execute anonymous Apex Code, by passing apex code string text to `Tooling#executeAnonymous`.

```javascript
/* @interactive */
// execute anonymous Apex Code
var apexBody = "System.debug('Hello, World');";
conn.tooling.executeAnonymous(apexBody, function(err, res) {
  if (err) { return console.error(err); }
  console.log("compiled?: " + res.compiled); // compiled successfully
  console.log("executed?: " + res.success); // executed successfully
  // ...
});
```


