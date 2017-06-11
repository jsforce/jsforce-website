## OAuth2

(Following examples are assuming running on express.js framework.)

### Authorization Request

First, you should redirect user to Salesforce page to get authorized. You can get Salesforce authorization page URL by `OAuth2#getAuthorizationUrl(options)`.

```javascript
var jsforce = require('jsforce');
//
// OAuth2 client information can be shared with multiple connections.
//
var oauth2 = new jsforce.OAuth2({
  // you can change loginUrl to connect to sandbox or prerelease env.
  // loginUrl : 'https://test.salesforce.com',
  clientId : '<your Salesforce OAuth2 client ID is here>',
  clientSecret : '<your Salesforce OAuth2 client secret is here>',
  redirectUri : '<callback URI is here>'
});
//
// Get authz url and redirect to it.
//
app.get('/oauth2/auth', function(req, res) {
  res.redirect(oauth2.getAuthorizationUrl({ scope : 'api id web' }));
});
```

### Access Token Request

After the acceptance of authorization request, your app is callbacked from Salesforce with authorization code in URL parameter. Pass the code to `Connection#authorize(code)` and get access token.

```javascript
//
// Pass received authz code and get access token
//
app.get('/oauth2/callback', function(req, res) {
  var conn = new jsforce.Connection({ oauth2 : oauth2 });
  var code = req.param('code');
  conn.authorize(code, function(err, userInfo) {
    if (err) { return console.error(err); }
    // Now you can get the access token, refresh token, and instance URL information.
    // Save them to establish connection next time.
    console.log(conn.accessToken);
    console.log(conn.refreshToken);
    console.log(conn.instanceUrl);
    console.log("User ID: " + userInfo.id);
    console.log("Org ID: " + userInfo.organizationId);
    // ...
  });
});
```


