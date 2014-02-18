---
---

### Setup

```shell
$ npm install jsforce
```

### Example

```javascript
var jsforce = require('jsforce');
var conn = new jsforce.Connection();
conn.login('username@domain.com', 'password', function(err, res) {
  if (err) { return console.error(err); }
  conn.query('SELECT Id, Name FROM Account', function(err, res) {
    if (err) { return console.error(err); }
    console.log(res);
  });
});
```
