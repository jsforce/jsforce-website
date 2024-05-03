---
---

## Tooling API

Tooling API is used to build custom development tools for Salesforce platform,
for example building custom Apex Code / Visualforce page editor.

It has almost same interface as the REST API,
so CRUD operations, query, and describe can be done also for these developer objects.

### CRUD to Tooling Objects

You can create/retrieve/update/delete records in tooling objects (e.g. ApexCode, ApexPage).

To get reference of tooling object, use `Tooling.sobject(sobjectType)`.

```javascript
/* @interactive */
const apexBody = [
  "public class TestApex {",
  "  public string sayHello() {",
  "    return 'Hello';",
  "  }",
  "}"
].join('\n');
const res = await conn.tooling.sobject('ApexClass').create({
  body: apexBody
});
console.log(res);
```

### Query Tooling Objects

Querying records in tooling objects is also supported.
Use `Tooling.query(soql)` or `SObject.find(filters, fields)`.

```javascript
/* @interactive */
const records = await conn.tooling.sobject('ApexTrigger')
  .find({ TableEnumOrId: "Lead" })
  .execute()
console.log(`fetched : ${records.length}`);
for (const record in records) {
  console.log(`Id: ${record.Id}`);
  console.log(`Name: ${record.Name}`);
}
```

### Describe Tooling Objects

Describing all tooling objects in the organization is done by calling `Tooling.describeGlobal()`.

```javascript
/* @interactive */
const res = await conn.tooling.describeGlobal()
console.log(`Num of tooling objects : ${res.sobjects.length}`);
```

Describing each object detail is done by calling `SObject.describe()` to the tooling object reference,
or just calling `Tooling.describeSObject(sobjectType)`.


```javascript
/* @interactive */
const res = await conn.tooling.sobject('ApexPage').describe()
console.log(`Label : ${res.label}`);
console.log(`Num of Fields : ${res.fields.length}`);
```

### Execute Anonymous Apex

You can use Tooling API to execute anonymous Apex Code, by passing apex code string text to `Tooling.executeAnonymous`.

```javascript
/* @interactive */
// execute anonymous Apex Code
const apexBody = "System.debug('Hello, World');";
const res = await conn.tooling.executeAnonymous(apexBody);
console.log(`compiled?: ${res.compiled}`); // compiled successfully
console.log(`executed?: ${res.success}`); // executed successfully
})()
```


