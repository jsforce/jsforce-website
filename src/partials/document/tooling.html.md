---
---

## Tooling API

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

