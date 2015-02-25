---
---

## API Limit and Usage

`Connection#limitInfo` is a property which stores the latest API usage information.

```javascript
/* @interactive */
console.log("API Limit: " + conn.limitInfo.apiUsage.limit);
console.log("API Used: " + conn.limitInfo.apiUsage.used);
```

Note that the limit information is available only after at least *one* REST API call, as it is included in response headers of API requests.

