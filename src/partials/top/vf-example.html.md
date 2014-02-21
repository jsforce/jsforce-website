---
---

### Example

```html
<apex:page docType="html-5.0" showHeader="false">
  <apex:includeScript value="{!URLFOR($Resource.JSforce)}" />
  <script>
var conn = new jsforce.Connection({ accessToken: '{!$API.Session_Id}' });
conn.query('SELECT Id, Name FROM Account', function(err, res) {
  if (err) { return console.error(err); }
  console.log(res);
});
  </script>
</apex:page>
```

