---
layout: default
headline: blog/headline
contentTemplate: blog/post
category: blog
title: JSforce 1.5 and Its Features
date: 2015-08-16
author:
  name: Shinichi Tomita
  url: https://github.com/stomita
---

JSforce version 1.5 has been released which includes several important updates.
The release of 1.5 had been planned to be just after the release of Summer '15, but delayed almost 2 months
because I couldn't share the time to check all issues related to the release.
Sorry for the delay to everyone who longly anticipated.

## Features

The table of release contents is [here](https://github.com/jsforce/jsforce/releases/tag/1.5.0),
but I'd like to pick up some features which become available in 1.5.


### Force.com SOAP API Support

Previously JSforce was called as Node-Salesforce, which was a simple JavaScript wrapper of Salesforce REST API.
There was a very little support of SOAP API just for `login` to establish session without OAuth.

As Force.com REST API is positioned as the successor of Force.com SOAP API, almost calls in SOAP API are already supported in REST API.
However, some business methods like `convertLead` or `merge` are still not available in REST API.

When it comes to calling SOAP API from JavaScript, you may remember that there has been an official toolkit named Ajax Toolkit in browser environment.
In this release we added support of Force.com SOAP API calls in JSforce, which is already available in Ajax Toolkit.
It means that now you can use the SOAP API calls in Node.js environment.
In browser environment, you don't have to load Ajax Toolkit anymore just for using these API calls.

Here is an example code for `convertLead` call in JSforce.

```javascript
var conn = new Connection();
conn.login(username, passowrd, function(err, res) {
  var leadConverts = [{
    convertedStatus: 'Closed - Converted',
    leadId: '00QE000000AzIq1MAF',
    accountId: '001E000000Im0jSIAR'
  }];
  conn.soap.convertLead(leadConverts, function(err, res) {
    if (err) { return console.error(err); }
    console.log('Success?:' + res.success);
    console.log('Lead ID: ' + res.lead);
    console.log('Converted Account ID: ' + res.accountId);
    console.log('Converted Contact ID: ' + res.contactId);
    console.log('Newly created Opportunity ID: ' + res.opportunityId);
  });
});
```

You might know that there are not only business calls like `convertLead` but CRUD calls in SOAP API, which is available in REST API too.
However, there is a big difference between them - SOAP calls can do manipulate multiple records at one API call.
We didn't add the CRUD call support in this release yet, but we are planning to in future.


### Streams3

Node.js has a built-in feature named "stream" which let you easily read data from a source and pipe it to a destination.

In JSforce, this stream feature is widely used for fetching record data, uploading data in bulk, and so on.

Historically Node.js stream has changed its interface and behavior in several times.
The stream of current Node.js (version 0.12) is called "streams3", which means 3rd version of the stream implementation.

Before version 1.5, JSforce was using streams1, which was a default stream implementation prior to Node.js ver 0.10.
As the streams1 mechanism was known for its stability issues, we need to migrate these code to streams3 as soon as possible.

Additionally, we also used our own stream implementation to support not only data stream but also object stream,
which is required while querying records in event-driven way.
As the latest Node.js stream has `objectMode` option, which does the exact same thing what we did want to,
the migration of stream would bring the benefit to reduce the redundant code.

Now we removed and replaced these codes entirely to fit the latest streams3 implementation.

For general developers, it wouldn't be affected so much by this change because it is simply our internal matter.
But for those who faced a trouble of bulk loading or stream piping, this release will give you much more stability comparing to previous.


### JSforce REPL Connection Registry

JSforce has a REPL feature for developers to inspect the JSforce functions interactively.
In this REPL you can connect to your Salesforce account by `.connect` or `.authorize` command.

The `.authorize` command utilizes OAuth2 web server flow to authorize the connection, so no username/password are passed to the REPL.
This is good because you don't have to struggle with the password, which requires much security concern.

For developers who wants to write a custom batch script and wants to reuse the connection of JSforce,
we opened the registry interface of JSforce connection.

To use the connection registry, first, you need to establish the connection by `.authorize` command in REPL.
In this flow, tokens are returned from Salesforce for API access authorization, stored in the registry automatically.

```
$ jsforce
> .authorize

... OAuth flow starts ...

Logged in as : user01@example.org
> .exit
```

After this procedure, you can use the established connection at any time.
Following code shows how to use :

```javascript
var jsforce = require('jsforce');
var conn = jsforce.registry.getConnection('user01@example.org'); // the connection name you established
conn.query('SELECT Id, Name FROM User', function(err, res) {
  // ...
});
```

The actual connection information is stored in `$HOME/.jsforce/config.json` file, which is read-protected by operating system.


### Test Environment Setup Script

JSforce has a bunch of test codes to keep its quality as much as possible and to catch up with the update of Salesforce API.
These test codes are assuming that they can connect to actual Salesforce account, not to local stub.

Because of this, we need to setup the Salesforce account to connect from the test codes before the execution.
However, the setup process of testing environment was not opened and only the author had the environment.
It was an obstacle for everyone other than the author who wants to contribute to JSforce project by sending pull request with tested code.

In this release, we created a package of testing environment and included a setup script.
If you signup and create developer edition organization, you can setup your own testing environment for JSforce.

The detail procedure of setting up the testing environment is written [here](https://github.com/jsforce/jsforce/blob/master/test/SETUP.md).
