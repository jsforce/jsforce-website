## OAuth2

(Following examples are assuming running on express.js framework.)

### Authorization Request

First, you should redirect user to the Salesforce auth page to get authorized. You can get the Salesforce auth URL by calling `OAuth2.getAuthorizationUrl(options)`.

```javascript
import { OAuth2 } from 'jsforce';

//
// OAuth2 client information can be shared with multiple connections.
//
const oauth2 = new OAuth2({
  // you can change loginUrl to connect to sandbox or prerelease env.
  // loginUrl : 'https://test.salesforce.com',
  clientId : '<your Salesforce OAuth2 client ID is here>',
  clientSecret : '<your Salesforce OAuth2 client secret is here>',
  redirectUri : '<callback URI is here>'
});
//
// Get authorization url and redirect to it.
//
app.get('/oauth2/auth', function(req, res) {
  res.redirect(oauth2.getAuthorizationUrl({ scope : 'api id web' }));
});
```

### Access Token Request

After the acceptance of authorization request, your app is called back from Salesforce with the authorization code in the `code` URL parameter. Pass the code to `Connection.authorize(code)` to get an access token.

For the refresh token to be returned from Salesforce, make sure that the following Scope is included in the Connected App `Perform requests at any time (refresh_token, offline_access)`
and `refresh_token` is included in the call to `getAuthorizationUrl()`.

```javascript
//
// Pass received authorization code and get access token
//
import { Connection } from 'jsforce';

app.get('/oauth2/callback', function(req, res) {
  const conn = new Connection({ oauth2 : oauth2 });
  const code = req.param('code');

  const userInfo = await conn.authorize(code)

  // Now you can get the access token, refresh token, and instance URL information.
  // Save them to establish connection next time.
  console.log(conn.accessToken);
  console.log(conn.refreshToken);
  console.log(conn.instanceUrl);
  console.log("User ID: " + userInfo.id);
  console.log("Org ID: " + userInfo.organizationId);
  // ...
  res.send('success'); // or your desired response
});
```

### JWT Bearer Flow (OAuth 2.0 JWT Bearer Flow)

If you have a Connected App you can use the JWT Bearer Flow to authenticate to the org. Pass the bearer token and grant type to `Connection.authorize({ bearerToken, grant_type })` and get the access token.

For more information about the setup, see: https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_jwt_flow.htm&type=5 

```javascript
import { Connection } from 'jsforce';
import * as jwt from 'jsonwebtoken'

const conn = new Connection()

const claim = {
  iss: ISSUER,
  aud: AUDIENCE,
  sub: 'user01@mydomain.example.org',
  exp: Math.floor(Date.now() / 1000) + 3 * 60
};
const bearerToken = jwt.sign(claim, cert, { algorithm: 'RS256'});
const userInfo = await conn.authorize({
  grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
  assertion: bearerToken
});

// Now you can get the access token and instance URL information.
// Save them to establish a connection next time.
console.log(conn.accessToken);
console.log(conn.instanceUrl);

// logged in user property
console.log("User ID: " + userInfo.id);
console.log("Org ID: " + userInfo.organizationId);
```

