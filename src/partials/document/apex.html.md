---
---

## Apex REST

If you have a static Apex class in Salesforce and are exposing it using "Apex REST" feature,
you can call it by using `Apex#get(path)`, `Apex#post(path, body)`, `Apex#put(path, body)`,
`Apex#patch(path, body)`, and `Apex#del(path, body)` (or its synonym `Apex#delete(path, body)`)
through `apex` API object in connection object.

```javascript
/* @interactive */
// body payload structure is depending to the Apex REST method interface.
var body = { title: 'hello', num : 1 };
conn.apex.post("/MyTestApexRest/", body, function(err, res) {
  if (err) { return console.error(err); }
  console.log("response: ", res);
  // the response object structure depends on the definition of apex class
});
```


