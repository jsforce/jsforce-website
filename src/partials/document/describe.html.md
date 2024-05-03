---
---

## Describe

Metadata description API for Salesforce object.

### Describe SObject

You can use `SObject.describe()` to fetch SObject metadata,

```javascript
/* @interactive */
const meta = await conn.sobject('Account').describe()
console.log(`Label : ${meta.label}`);
console.log(`Num of Fields : ${meta.fields.length}`);
```

or can use `Connection.describe(sobjectType)` (or its synonym `Connection.describeSObject(sobjectType)`) alternatively.

```javascript
/* @interactive */
const meta = await conn.describe('Account')
console.log(`Label : ${meta.label}`);
console.log(`Num of Fields : ${meta.fields.length}`);
```

### Describe Global

`SObject.describeGlobal()` returns all SObject information registered in Salesforce (without detail information like fields, childRelationships).

```javascript
/* @interactive */
const res = await conn.describeGlobal()
console.log(`Num of SObjects : ${res.sobjects.length}`);
```

### Cached Call

Each description API has "cached" version with suffix of `$` (coming from similar pronounce "cash"), which keeps the API call result for later use.

```javascript
/* @interactive */
// First lookup local cache, and then call remote API if cache doesn't exist.
const meta = await conn.sobject('Account').describe$()
console.log(`Label : ${meta.label}`);
console.log(`Num of Fields : ${meta.fields.length}`);
```

Cache clearance should be done explicitly by developers.

```javascript
// Delete cache of global sobject description
conn.describeGlobal$.clear();
```

```javascript
// Delete all API caches in connection.
conn.cache.clear();
```

