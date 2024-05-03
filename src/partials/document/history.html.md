---
---

## History

### Recently Accessed Records

`SObject.recent()` returns recently accessed records in the SObject.

```javascript
/* @interactive */
const res = await conn.sobject('Account').recent()
console.log(res)
```

`Connection.recent()` returns records in all object types which were recently accessed.

```javascript
/* @interactive */
const res = await conn.recent()
console.log(res)
```

### Recently Updated Records

`SObject.updated(startDate, endDate)` returns record IDs which are recently updated.

```javascript
/* @interactive */
const res = await conn.sobject('Account').updated('2014-02-01', '2014-02-15');
console.log(`Latest date covered: ${res.latestDateCovered}`);
console.log(`Updated records : ${res.ids.length}`);
```

### Recently Deleted Records

`SObject.deleted(startDate, endDate)` returns record IDs which were recently deleted.

```javascript
/* @interactive */
const res = await conn.sobject('Account').deleted('2014-02-01', '2014-02-15');
console.log(`Ealiest date available: ${res.earliestDateAvailable}`);
console.log(`Latest date covered: ${res.latestDateCovered}`);
console.log(`Deleted records : ${res.deletedRecords.length}`);
```

