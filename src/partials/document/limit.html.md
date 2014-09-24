---
---

## API Limit and Usage

`Connection#limitInfo` is a property which stores the latest API usage information.

```javascript
/* @interactive */
console.log("API Limit: " + conn.limitInfo.apiUsage.limit);
console.log("API Used: " + conn.limitInfo.apiUsage.used);
```

