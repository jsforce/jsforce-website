---
---

## Identity

`Connection#identity()` is available to get current API session user identity information.

```javascript
/* @interactive */
conn.identity(function(err, res) {
  if (err) { return console.error(err); }
  console.log("user ID: " + res.user_id);
  console.log("organization ID: " + res.organization_id);
  console.log("username: " + res.username);
  console.log("display name: " + res.display_name);
});
```

