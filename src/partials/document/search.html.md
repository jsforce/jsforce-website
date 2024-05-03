---
---

## Search

`Connection.search` allows you to search records with SOSL in multiple objects.

```javascript
/* @interactive */
const res = await conn.search("FIND {Un*} IN ALL FIELDS RETURNING Account(Id, Name), Lead(Id, Name)");
console.log(res.searchRecords)
);
```


