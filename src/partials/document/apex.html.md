---
---

## Apex REST

If you have a static Apex class in Salesforce and are exposing it using "Apex REST" feature,
you can call it by using `Apex.get(path)`, `Apex.post(path, body)`, `Apex.put(path, body)`,
`Apex.patch(path, body)`, and `Apex.del(path, body)` (or its synonym `Apex.delete(path, body)`)
through the `apex` API object.

```javascript
/* @interactive */
// body payload structure is depending to the Apex REST method interface.
const body = { title: 'hello', num : 1 };
const res = await conn.apex.post("/MyTestApexRest/", body);
console.log("response: ", res);
```


