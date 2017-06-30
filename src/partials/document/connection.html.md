---
---

## Connection

### Username and Password Login

When you have a Salesforce username and password (and maybe security token, if required),
you can use `Connection#login(username, password)` to establish a connection to Salesforce.

By default, it uses SOAP login API (so no OAuth2 client information is required).

```javascript
var jsforce = require('jsforce');
var conn = new jsforce.Connection({
  // you can change loginUrl to connect to sandbox or prerelease env.
  // loginUrl : 'https://test.salesforce.com'
});
conn.login(username, password, function(err, userInfo) {
  if (err) { return console.error(err); }
  // Now you can get the access token and instance URL information.
  // Save them to establish connection next time.
  console.log(conn.accessToken);
  console.log(conn.instanceUrl);
  // logged in user property
  console.log("User ID: " + userInfo.id);
  console.log("Org ID: " + userInfo.organizationId);
  // ...
});
```

### Username and Password Login (OAuth2 Resource Owner Password Credential)

When OAuth2 client information is given, `Connection#login(username, password + security_token)` uses OAuth2 Resource Owner Password Credential flow to login to Salesforce.

```javascript
var jsforce = require('jsforce');
var conn = new jsforce.Connection({
  oauth2 : {
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl : 'https://test.salesforce.com',
    clientId : '<your Salesforce OAuth2 client ID is here>',
    clientSecret : '<your Salesforce OAuth2 client secret is here>',
    redirectUri : '<callback URI is here>'
  }
});
conn.login(username, password, function(err, userInfo) {
  if (err) { return console.error(err); }
  // Now you can get the access token and instance URL information.
  // Save them to establish connection next time.
  console.log(conn.accessToken);
  console.log(conn.instanceUrl);
  // logged in user property
  console.log("User ID: " + userInfo.id);
  console.log("Org ID: " + userInfo.organizationId);
  // ...
});
```

### Session ID

If Salesforce session ID and its server URL information is passed from Salesforce (from 'Custom Link' or something),
you can pass it to the constructor.


```javascript
var jsforce = require('jsforce');
var conn = new jsforce.Connection({
  serverUrl : '<your Salesforce server URL (e.g. https://na1.salesforce.com) is here>',
  sessionId : '<your Salesforce session ID is here>'
});
```

### Access Token

After the login API call or OAuth2 authorization, you can get the Salesforce access token and its instance URL.
Next time you can use them to establish a connection.

```javascript
var jsforce = require('jsforce');
var conn = new jsforce.Connection({
  instanceUrl : '<your Salesforce server URL (e.g. https://na1.salesforce.com) is here>',
  accessToken : '<your Salesforrce OAuth2 access token is here>'
});
```

### Access Token with Refresh Token

If a refresh token is provided in the constructor, the connection will automatically refresh the access token when it has expired.

NOTE: Refresh token is only available for OAuth2 authorization code flow.

```javascript
var jsforce = require('jsforce');
var conn = new jsforce.Connection({
  oauth2 : {
    clientId : '<your Salesforce OAuth2 client ID is here>',
    clientSecret : '<your Salesforce OAuth2 client secret is here>',
    redirectUri : '<your Salesforce OAuth2 redirect URI is here>'
  },
  instanceUrl : '<your Salesforce server URL (e.g. https://na1.salesforce.com) is here>',
  accessToken : '<your Salesforrce OAuth2 access token is here>',
  refreshToken : '<your Salesforce OAuth2 refresh token is here>'
});
conn.on("refresh", function(accessToken, res) {
  // Refresh event will be fired when renewed access token
  // to store it in your storage for next request
});

// Alternatively, you can use the callback style request to fetch the refresh token
conn.oauth2.refreshToken(refreshToken, (err, results) => {
  if (err) return reject(err);
  resolve(results);
});
```


### Logout

Call `Connection#logout()` to logout from the server and invalidate current session.
It is valid for both SOAP API based sessions and OAuth2 based sessions.

```javascript
var jsforce = require('jsforce');
var conn = new jsforce.Connection({
  sessionId : '<session id to logout>',
  serverUrl : '<your Salesforce Server url to logout>'
});
conn.logout(function(err) {
  if (err) { return console.error(err); }
  // now the session has been expired.
});
```

