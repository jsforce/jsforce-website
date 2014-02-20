---
---

## Search

`Connection#search` enables you to search records with SOSL in multiple objects.

```javascript
/* @interactive */
conn.search("FIND {Un*} IN ALL FIELDS RETURNING Account(Id, Name), Lead(Id, Name)",
  function(err, res) {
    if (err) { return console.error(err); }
    console.log(res);
  }
);
```


