---
---

## History

### Recently Accessed Records

`SObject#recent()` returns recently accessed records in the SObject.

```javascript
/* @interactive */
conn.sobject('Account').recent(function(err, res) {
  if (err) { return console.error(err); }
  console.log(res);
});
```

`Connection#recent()` returns records in all object types which are recently accessed.

```javascript
/* @interactive */
conn.recent(function(err, res) {
  if (err) { return console.error(err); }
  console.log(res);
});
```

### Recently Updated Records

`SObject#updated(startDate, endDate)` returns record IDs which are recently updated.

```javascript
/* @interactive */
conn.sobject('Account').updated('2014-02-01', '2014-02-15', function(err, res) {
  if (err) { return console.error(err); }
  console.log("Latest date covered: " + res.latestDateCovered);
  console.log("Updated records : " + res.ids.length);
});
```

### Recently Deleted Records

`SObject#deleted(startDate, endDate)` returns record IDs which are recently deleted.

```javascript
/* @interactive */
conn.sobject('Account').deleted('2014-02-01', '2014-02-15', function(err, res) {
  if (err) { return console.error(err); }
  console.log("Ealiest date available: " + res.earliestDateAvailable);
  console.log("Latest date covered: " + res.latestDateCovered);
  console.log("Deleted records : " + res.deletedRecords.length);
});
```

