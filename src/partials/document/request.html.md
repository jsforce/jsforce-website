---
---

## Request

Make REST api calls to APIs that are not explicitly supported by JSForce.

### Setting the URL

The Endpoint URL can be in one of the following formats:

- Absolute URL: `https://na1.salesforce.com/services/data/v32.0/sobjects/Account/describe`.
- Relative path from root: `/services/data/v32.0/sobjects/Account/describe`.
- Relative path from version root: `/sobjects/Account/describe`.
  - This is only supported if you have explicitly set a default version.

### Making Requests

You can use `Connection#request()` to make api requests.

For GET requests, you can pass in a string URL.

```javascript
/* @interactive */
conn.request('/services/data/v47.0/ui-api/object-info').then(response => {
  console.log(response);
});
```

If you prefer to use callbacks instead of promises, pass a callback as the second parameter.

```javascript
conn.request('/services/data/v47.0/ui-api/object-info', function(err, response) {
  console.log(response);
});
```

For other HTTP methods, you can pass an object to the request method. Ensure that you serialize the body of the request.

```javascript
/* @interactive */
// Bulk API 2.0 - Query
const requestBody = {
  operation: 'query',
  query: 'SELECT Id, Name FROM Account LIMIT 1000',
};

conn
  .request({
    method: 'POST',
    url: '/services/data/v47.0/jobs/query',
    body: JSON.stringify(requestBody),
    headers: {
      'content-type': 'application/json',
    },
  })
  .then(response => {
    console.log(response);
  });
```

#### Request Helper Methods

In addition to `Connection#request()`, JSForce provides the following helper methods that can also be used:

- `Connection#requestGet()`
- `Connection#requestPatch()`
- `Connection#requestPost()`
- `Connection#requestPut()`
- `Connection#requestDelete()`

For `requestPatch`, `requestPost` and `requestPut`, these will be serialized automatically and the `content-type` will be set to `application/json`.

```javascript
/* @interactive */
const requestBody = {
  operation: 'query',
  query: 'SELECT Id, Name FROM Account LIMIT 1000',
};

conn.requestPost('/services/data/v47.0/jobs/query', requestBody).then(response => {
  console.log(response);
});
```

#### Request HTTP Options

All request methods allow setting HTTP options to be passed to the HTTP request.

| Name              | Type      | Description                                                                                                                                                                                                                                                         |
| ----------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| responseType      | string    | overrides the content-type from the response to change how the response is parsed. Valid values are `text/xml`, `application/xml`, `application/json`, `text/csv`. If you do not want JSForce to auto-parse the response, set this to any other value, e.x. `text`. |
| noContentResponse | any       | Alternative response when no content returned in response (= HTTP 204)                                                                                                                                                                                              |
| transport         | Transport | Transport for http api - you should not need to set this option.                                                                                                                                                                                                    |

If you would like to opt-out of parsing, you can set the `responseType` to text. This is useful if you want the raw response from Salesforce instead of having the results automatically parsed.

```javascript
// Get raw CSV data instead of allowing JSForce to parse the CSV to JSON
requestGet('/services/data/v47.0/jobs/query/7502J00000LYZC4QAP/results', { responseType: 'text' }).then(response => {
  console.log(response);
});
```
