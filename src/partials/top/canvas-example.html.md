---
---

### Example

```erb
<!DOCTYPE html>
<html>
<head>
  <meta id="sf-canvas-signed-request" content="<%= verifiedSignedRequestJSON %>" />
  <script src="https://login.salesforce.com/canvas/sdk/js/29.0/canvas-all.js"></script>
  <script src="/js/jsforce.js"></script>
  <script>
var sr = document.getElementById('sf-canvas-signed-request').content;
var conn = new jsforce.Connection({ signedRequest: sr });
conn.query('SELECT Id, Name FROM Account', function(err, res) {
  if (err) { return console.error(err); }
  console.log(res);
});
  </script>
</head>
<body>
</body>
</html>
```

