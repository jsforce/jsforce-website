---
---

## Identity

`Connection.identity()` is available to get current API session user identity information.

```javascript
/* @interactive */
const res = await conn.identity()
console.log(`user ID: ${res.user_id}`);
console.log(`organization ID: ${res.organization_id}`);
console.log(`username: ${res.username}`);
console.log(`display name: ${res.display_name}`);
```

