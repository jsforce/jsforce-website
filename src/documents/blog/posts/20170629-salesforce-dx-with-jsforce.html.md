---
layout: default
headline: blog/headline
contentTemplate: blog/post
category: blog
title: Creating Scratch Org in Salesforce DX from API using JSforce
date: 2017-06-29
author:
  name: Shinichi Tomita
  url: https://github.com/stomita
---

Now [SalesforceDX](https://developer.salesforce.com/platform/dx) has finally become "Open Beta".
There are many features related to improving the "DX", but the most anticipated feature must be "Scratch Org",
which you can create a brand new clean Salesforce organization programatically and instantly.
Thanks to this feature you can reduce the possibility of environment-dependent test errors/successes you might have faced when you reused one organization repeatedly.

As an official CLI software (sldx) is provided so you can download and install it, but when you want to setup it from your build scripts it might not be the suitable one.

## Creating Scratch Org from REST API

In fact, to create a new scratch org, what you should do is just inserting a new record in a Salesforce Object in developer hub organization.
So you can request a new scratch org whatever language your build script is written in - Java, Ruby, JavaScript, or even Apex.  

Here is an example client script to create and connect to a new scratch org, using JSforce and Node.js and written in ES2017 (including async/await notation).

```js
import fs from 'fs';
import jsforce from 'jsforce';

/**
 *
 */
async function startScratchOrg(username, password, options) {
  // establish oauth2 connection to dev hub org using jsforce
  const hubConn = new jsforce.Connection({ ...options, version: '40.0' });
  const hubUserInfo = await hubConn.login(username, password);
  const hubUser = await hubConn.sobject('User').findOne({ Id: hubUserInfo.id }, 'Id,Username,Email');
  console.log(`Connected to developer hub org: username = ${hubUser.Username}`);
  const ScratchOrgInfo = hubConn.sobject('ScratchOrgInfo');
  try {
    await ScratchOrgInfo.describe();
  } catch (e) {
    throw new Error('Dev hub org is not enabled for this connection');
  }

  // create scratch org
  console.log('Creating scratch org....');
  const { id, success, errors } = await ScratchOrgInfo.create({
    Country: 'JP',
    Edition: 'Developer',
    OrgName: 'testorg',
    AdminEmail: hubUser.Email,
    ConnectedAppConsumerKey: options.clientId,
    ConnectedAppCallbackUrl: options.redirectUri,
  });
  if (!success) {
    console.error(errors);
    throw new Error('Error occurred while creating scratch org');
  }
  const orgInfo = await ScratchOrgInfo.retrieve(id);
  console.log(`New scratch org has been created. ${orgInfo.Name}`);

  // establish connection
  const loginUrl = `https://${orgInfo.SignupInstance}.salesforce.com`;
  const conn = new jsforce.Connection({ ...options, loginUrl });
  const userInfo = await conn.authorize(orgInfo.AuthCode);
  const user = await conn.sobject('User').findOne({ Id: userInfo.id });
  console.log(`Connected with scratch org: username = ${user.Username}`);

  // package deployment / data loading tasks from here
  // ...
}

startScratchOrg('admin@devhub.example.org', 'passw0rd', {
  // you should obtain client id / secret by registering a connected application
  clientId: 'yyyyyyyyyyyyy',
  clientSecret: 'xxxxxx',
  redirectUri: 'http://localhost/callback',
});

```

The `AuthCode` property value in created `ScratcOrgInfo` record is the same as the code what you would get from OAuth2 authorication code flow and
it has rather short expiration period.
So you would be better to get access/refresh tokens immediately after the creation.
By keeping the refresh token you can connect to the created organization next time, but if you forget you will not be able to connect again.
You can simply delete the created org, though.

If you use [JWT Bearer](https://help.salesforce.com/HTViewHelpDoc?id=remoteaccess_oauth_jwt_flow.htm) it will be much simpler and you don't have to care about the above issue.
JWT bearer flow allows one certificate to connect multiple orgs, you should only care about the certificate.

There is a number limit in active scratch organization, you should delete organizations after you used them.
To delete a scratch organization, you should delete the record in `ActiveScratchOrg` object.
When you delete the `ActiveScratchOrg` entry, corresponding organization entry in `ScratchOrgInfo` changes its status to `Deleted`.
It seems that you can directly delete `ScratchOrgInfo` entry, but I'm not sure it is safe.
