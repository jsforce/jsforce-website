---
layout: default
headline: blog/headline
contentTemplate: blog/post
category: blog
title: 5 Tips You Should Know When Using JSforce REPL 
date: 2015-01-15
---

If you are already using JSforce, you may be aware of its REPL. If not, you are definitely losing time in learning APIs.

JSforce REPL is an extension of Node.js REPL (Read-Eval-Print Loop), which enables you to try and execute Salesforce APIs (REST, Bulk, Chatter, Metadata, and so on) in interactive manner.  

I recently noticed that people are not fully utilizing features in the REPL. Here I would like to pick up some tips in JSforce REPL which I really think very useful.

### 1. Use ".authorize" Command to Create Persisting Connection

When you are connectiong to Salesforce in JSforce, you may be using `.connect` command with username/password.

```
$ jsforce
> .connect username@example.org
Password: *******
Logged in as: username@example.org
> 
```

But inputting password to establish connection for each time is sometime considered to be a painful work.

JSforce supports OAuth2 authorization to establish connection. OAuth2 has a mechanism to refresh access token after the session expiration, which is called refresh token flow. JSforce REPL has built-in ability to initiate OAuth flow, obtain refesh token, and keep it securely in OS filesystem. So you don't have to worry about handling it.

To be authorized in JSforce via OAuth2, use `.authorize` command instead of `.connect`.

```
> .authorize
```

The command will pop up a browser window to prompt OAuth authorization.

Before using `.authorize` command, you should first register an OAuth client for JSforce REPL in Connected Apps on your developer organization, which does not have to be the organization you’re going to connect. When registering a Connected App for JSforce, the callback URL should be start with `http://localhost:<any_available_port_number>/`.

Then use `.register` command in JSforce to start interactive wizard to register client information in configuration.

```
> .register
Input client ID (consumer key) : 3MVG9A2kN3....bhT
Input client secret (consumer secret) : 21864....158
Input redirect URI : http://localhost:34321/oauth2/callback
Input login URL (default is https://login.salesforce.com) : 
Client registered successfully.
>
```

Once OAuth2 authorization has been accomplished, connection will automatically refreshed even if the session has been expired. You can use `.connect` command with authorized Salesforce username. It will connect automatically without password prompt.

```
> .connect username@example.org
Refreshing access token ... 
Logged in as : username@example.org
>
```

The `.authorize` and `.register` command accepts an argument which specifies client name. So you can switch multiple OAuth2 clients for sandbox, prerelease, or private login server hosted under My Domain.


### 2. Use "Tab" Key to Complete Everything

As the JSforce REPL is an extension of Node.js REPL, it comletes methods and properties defined in JSforce APIs. For example, when you want to try `describeGlobal()` API in the REPL, type `desc` and press "Tab" key. It automatically completes the word to `describe` and show candidates in screen.

```
> desc[TAB]
describe          describe$         describeGlobal    describeGlobal$   describeSObject   describeSObject$

> describe
```

Not only methods or properties in REPL context, it also completes REPL command arguments. For example, `.connect` command accepts Salesforce username in its first argument. If you have already established connection information in configuration, it will automatically completes from registered username.

```
> .connect adm[TAB]
admin@demo01.example.org             admin@demo01.example.org.sandbox              admin@summer14pre.mydomain.org

> .connect admin@
```

### 3. Utilize Promise Auto Evaluation to Avoid Callback

JSforce has two different ways to handle asynchronous API. First one is callback, which is widely used to express asynchronous process in JavaScript world.

```
> var debugOut = function(err, res) { if (err) { console.error(err); } else { console.log(res); } }; 
undefined
> sobject('Account').create({ Name: 'My Test Account' }, debugOut);
{ id: '001E00000169xdnIAA',
  success: true,
  errors: [] }
```

However, specifing callback function for each time to call out the API is a little cumbersome.

In JSforce REPL, it adds support of "Promise Auto Evaluation" - if the returned value to REPL has promise A+ interface (thennable) it will be automatically evaluated and wait display output untill promise evaluation is completed. This feature brings the experience as if REPL users are making synchronous API calls.

```
> sobject('Account').create({ Name: 'My Test Account' });
{ id: '001E00000169xddIAA',
  success: true,
  errors: [] }
> 
```

### 4. Utilize "_" Variable to Access the Latest Evaluated Result

As same as Node.js REPL, JSforce REPL has special variable _ (underscore), which contains the result of the last expression. In addition to normal Node.js REPL behavior, it keeps evaluated promise value in it if the last expression leads to promise auto evaluation.

```
> query("SELECT Id, Name FROM Account WHERE Name LIKE 'P%'");
{ totalSize: 1,
  done: true,
  records: 
   [ { attributes: [Object],
       Id: '001E000000Im0jSIAR',
       Name: 'Pyramid Construction Inc.' } ] }
> _.records.length
1
>
```

Please be aware that variable _ (underscore) is overwritten in each REPL evaluation. So if you want to use the returned value in several times in REPL, you should first evacuate the value to another variable.

```
> query("SELECT Id, Name FROM Account WHERE Name LIKE 'P%'");
{ totalSize: 1,
  done: true,
  records: 
   [ { attributes: [Object],
       Id: '001E000000Im0jSIAR',
       Name: 'Pyramid Construction Inc.' } ] }
> var qr = _;
{ totalSize: 1,
  done: true,
  records: 
   [ { attributes: [Object],
       Id: '001E000000Im0jSIAR',
       Name: 'Pyramid Construction Inc.' } ] }
> qr.records.length
1
> qr.done
true
>
```


### 5. Use CoffeScript REPL to Reduce Typing Effort

JavaScript sometime tends to be verbose in description, such as writing parens or function declaration. In REPL, you may prefer CoffeeScript to keep the typing minimal.

When you set `--coffee` in booting JSforce REPL, it use CoffeeScript REPL instead of Node.js REPL.

```
$ jsforce --coffee
coffee>
```

If you try to execute a simple SOQL, just type as follows. You will see no parens are required to type.

```
coffee> query "SELECT Id, Name FROM Account"
{ totalSize: 11,
  done: true,
  records: 
   [ { attributes: [Object],
       Id: '001E000000Im0jSIAR',
       Name: 'Pyramid Construction Inc.' },
     { attributes: [Object],
       Id: '001E000000Im0jQIAR',
       Name: 'Edge Communications' },
     { attributes: [Object],
       Id: '001E000000Im0jUIAR',
       Name: 'Grand Hotels & Resorts Ltd' },
       ...
```




