---
layout: default
headline: blog/headline
contentTemplate: blog/post
category: blog
title: 5 Tips You Should Know When Using JSforce REPL 
date: 2015-01-15
author:
  name: Shinichi Tomita
  url: https://github.com/stomita
---

If you are already using JSforce, you may be aware of its REPL. If not, you are definitely spending time and spending in learning APIs.

JSforce REPL is an extension of Node.js REPL (Read-Eval-Print Loop), which enables you to try and execute Salesforce APIs (REST, Bulk, Chatter, Metadata, and so on) in interactive manner.

I recently noticed that people are not fully utilizing features in the REPL. Here I would like to pick up some tips in JSforce REPL which I really think very useful.

### 1. Use ".authorize" Command to Create Persisting Connection

When you are connecting to Salesforce in JSforce, you may be using `.connect` command with username/password.

```
$ jsforce
> .connect username@example.org
Password: *******
Logged in as: username@example.org
> 
```

But inputting password to establish connection for each time is sometime considered to be a painful work.

JSforce supports OAuth2 authorization to establish connection. OAuth2 has a mechanism to refresh access token after the session expiration, which is called refresh token flow. JSforce REPL has built-in ability to initiate OAuth flow, obtain refresh token, and keep it securely in OS file system. So you don't have to worry about handling it.

To be authorized in JSforce via OAuth2, use `.authorize` command instead of `.connect`.

```
> .authorize
```

The command will pop up a browser window to prompt OAuth authorization.

Before using `.authorize` command, you should first register an OAuth client for JSforce REPL in Connected Apps on your developer organization, which does not have to be the organization you’re going to connect. When registering a Connected App for JSforce, the callback URL should be starting with `http://localhost:<any_available_port_number>/`.

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

Once OAuth2 authorization has been accomplished, the connection will automatically be refreshed even after session expiry. You can use `.connect` command with authorized Salesforce username, then connect automatically without password prompt.

```
> .connect username@example.org
Refreshing access token ... 
Logged in as : username@example.org
>
```

The `.authorize` and `.register` command accepts an optional argument which can specify client name. So you can switch multiple OAuth2 clients for sandbox, prerelease, or private login server hosted under My Domain.


### 2. Use "Tab" Key to Complete Everything

As the JSforce REPL is an extension of Node.js REPL, it can complete method names or properties defined in JSforce APIs. For example, when you want to try `describeGlobal()` API in the REPL, type `desc` and press "Tab" key. It automatically completes the word to `describe` and show possible candidates in your screen.

```
> desc[TAB]
describe          describe$         describeGlobal    describeGlobal$   describeSObject   describeSObject$

> describe
```

Not only methods or properties in REPL context, it also completes REPL command arguments. For example, `.connect` command accepts Salesforce username in its first argument. If you have connections you have established ever, it will automatically complete and show candidate list of usernames.

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

In JSforce REPL, it adds support of "Promise Auto Evaluation" - if the value returned to REPL has promise A+ interface (thenable) it will be automatically evaluated and waits display output until promise evaluation is completed. This feature brings an experience as if REPL users are making synchronous API call.

```
> sobject('Account').create({ Name: 'My Test Account' });
{ id: '001E00000169xddIAA',
  success: true,
  errors: [] }
> 
```

### 4. Utilize "_" Variable to Access the Latest Evaluated Result

Same as Node.js REPL, JSforce REPL has special variable _ (underscore), which contains the result of the last expression. In addition to normal Node.js REPL behavior, it also keeps evaluated value of the promise if the last expression returns a promise value.

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

Please be aware that variable _ (underscore) is overwritten in each REPL evaluation. So if you want to use the value in several times in REPL, you should first evacuate it to another variable.

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

Some people may think JavaScript is verbose in description, especially writing parentheses or function declaration. You may prefer CoffeeScript because of its simple and minimal description.

When you set `--coffee` option when booting JSforce REPL, it use CoffeeScript REPL instead of Node.js REPL.

```
$ jsforce --coffee
coffee>
```

To execute a simple SOQL, just type as follows. You can see no parentheses are required.

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



