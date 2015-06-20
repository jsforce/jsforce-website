---
layout: default
headline: blog/headline
contentTemplate: blog/post
category: blog
title: Querying Salesforce Data Without Consuming API Request Quota
date: 2015-04-05
author:
  name: Shinichi Tomita
  url: https://github.com/stomita
---

In order to query the data stored in Salesforce, a query language named SOQL is used generally.
As Salesforce opens REST/SOAP API endpoint access, we can send the SOQL message in the API request.

This API can also be used when you are developing HTML5, Single Page Application(SPA).
You might have to care about Same Origin Policy and Cross Origin Resource Sharing (CORS) setting if the app resides outside of Salesforce,
but not applied to the case when the app is served on Visualforce Page.


## API Limitation and Workarounds

Talking about the Salesforce API, there is an important limitation which we must care about.
That is, the Salesforce API has a request quota per day per organization -
roughly saying, there is an upper limit in proportion to the number of subscribing user licenses.
Because of this limitation, a bad-mannered application which calls API request frequently could easily run out of the resource.

### JavaScript Remoting

However, when your SPA is working on Visualforce Page, there is a workaround - [JavaScript Remoting](https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_js_remoting.htm).

JavaScript Remoting is a Force.com feature to access Apex class static method from Visualforce by calling asynchronous JavaScript function.
In JavaScript Remoting, apex code basically defines data access query, in contrast to the case of executing SOQL query via API.

##### Server (Apex)
```java
public class RemoteController {
    @RemoteAction
    public static List<Account> searchAccount(String name) {
        name = name+'%';
        return [SELECT Id, Name, Type FROM Account WHERE Name LIKE :name];
    }
}
```

##### Client(JavaScript)
```javascript
RemoteController.searchAccount('ACME', function(accounts, event) {
    if (event.status) {
        console.log(accounts);
    } else if (event.type === 'exception') {
        console.error(event.message, event.where);
    )
});
```


### RemoteTK

Using this JavaScript Remoting feature, Pat Patterson in salesforce.com had previously published a library named  [RemoteTK](https://developer.salesforce.com/blogs/developer-relations/2012/10/not-calling-the-rest-api-from-javascript-in-visualforce-pages.html).

Roughly saying, RemoteTK is a technique which serves a JavaScript Remoting method accepting raw SOQL query string, passing it directly to query execution engine, then returning the queried result.

```java
@remoteAction
public static String query(String soql) {
    List<sObject> records;
    try {
        records = Database.query(soql);
    } catch (QueryException qe) {
        return makeError(qe.getMessage(), 'INVALID_QUERY');
    }

    Map<String, Object> result = new Map<String, Object>();
    result.put('records', records);
    result.put('totalSize', records.size());
    result.put('done', true);

    return JSON.serialize(result);
}
```

As it will be stated later, this approach has a significant problem. The RemoteTk code was opened inside of [Force.com JavaScript Toolkit](https://github.com/developerforce/Force.com-JavaScript-REST-Toolkit), but now it has been removed.

### Visualforce Remote Object

Another new workaround is [Visualforce Remote Objects](https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_remote_objects.htm), which is generally available from Winter'15.
It also can be used to avoid consuming API request quota.

```html
   <apex:remoteObjects >
        <apex:remoteObjectModel name="Warehouse__c" jsShorthand="Warehouse"
            fields="Name,Id">
            <apex:remoteObjectField name="Phone__c" jsShorthand="Phone"/>
        </apex:remoteObjectModel>
    </apex:remoteObjects>

    <!-- JavaScript to make Remote Objects calls -->
    <script>
        var fetchWarehouses = function(){
            // Create a new Remote Object
            var wh = new SObjectModel.Warehouse();

            // Use the Remote Object to query for 10 warehouse records
            wh.retrieve({ limit: 10 }, function(err, records, event){
                if(err) {
                    alert(err.message);
                }
                else {
                    var ul = document.getElementById("warehousesList");
                    records.forEach(function(record) {
                        // Build the text for a warehouse line item
                        var whText = record.get("Name");
                        whText += " -- ";
                        whText += record.get("Phone");

                        // Add the line item to the warehouses list
                        var li = document.createElement("li");
                        li.appendChild(document.createTextNode(whText));
                        ul.appendChild(li);
                    });
                }
            });
        };
    </script>
```

## Issues for Each Workarounds

Above workarounds cannot be perfect solutions which can replace the usage of API. I'll state the reasons why:

### 1. JavaScript Remoting cannot describe query freely

When using JavaScript Remoting, it is common that the query construction will be done in server-side.
Clients would not be entitled to specify the query as flexible as SOQL.
Of course, you can manage it by passing parameters and constructing SOQL dynamically, but it tends to be a complex work.

### 2. RemoteTK is not secure

When executing SOQL via Salesforce API, the data access is always protected under the authorized user's context.
That is, it is secure because it assures that the user cannot access the data which are not allowed by sharing rule or object/field access permission.
In other word, any query you request via API will get the information which you can browse in a web browser.

However, query in Apex code runs under system privilege.
Record-level access control is applied when the Apex class has `with sharing` keyword, but object-level and field-level access control will be ignored.

As RemoteTK executes a raw SOQL received from the client, it easily leads to elevation of privilege.

### 3. Visualforce Remote Objects is still not flexible

In Visualforce Remote Objects, the query will be executed under the logged-in user's context. So the elevation of privilege issue stated above will not occur.
In addition to that, it seems flexible because the query can set filters or sort order conditions in JavaScript.
However, even Remote Objects still faces a limitation of flexibility.

First, you should pre-define target objects/fields to retrieve in a query using tags in Visualforce page.
There are applications which really need to specify target objects/fields dynamically.
SOQL from API can do this, but Remote Objects cannot.

Secondly, there is a limitation of fetching fields - it must be a field of the target object.
That is, you cannot walk through relationship fields, neither parent nor child.

### Features for Ideal Salesforce Data Query

Now I summary the ideal data query features while developing SPA of Salesforce.

1. Can construct query dynamically in client side (JavaScript controls it)
2. Securely respects access control setting in Salesforce
3. Doesn't consume API request quota

RemoteTK achieved 1. and 3., but 2. was essentially impossible.
To support Field-level security (FLS) it needs parsing SOQL, which is not only very difficult in Apex but also seems futile work.

Remote Objects seems doing well each of them, but my expectation is far beyond.

## Solution

The problem of RemoteTK was it cannot check FLS because query is serialized in SOQL.
Consider that if it were passed as already parsed data structure, it would be another story.
Apex has the way to describe object or field's metadata and check the access control information of the current user.
Using this information, it will be possible to check whether all target objects and fields in the query are accessible or not.

So, we use JSON string as a query, not raw SOQL like RemoteTK.
RemoteTK is doing a similar usage of JSON as query, but my proposal is to include not only filter or sort condition but also retrieving fields and target objects.

##### Client (JavaScript)
```javascript
// Define query in JSON
var queryConfig = {
  "fields": [ "Id", "Name", "Account.Name" ],
  "table": "Contact",
  "condition": {
    "operator": "AND",
    "conditions": [{
       "field": "CloseDate",
       "operator": "=",
       "value": { "type": "date", "value": "THIS_MONTH" }
    }, {
       "field": "Amount",
       "operator": ">",
       "value": 20000
    }]
  },
  "sortInfo": [{
    "field": "CloseDate",
    "direction": "ASC"
  }],
  "limit": 10000
};
// Pass the query config to Apex through JavaScript Remoting. JSON should be serialized in advance.
MyRemoteController.query(JSON.stringify(queryConfig), function(records, event) {
  if (event.status) {
    console.log(records);
  } else {
    console.error(event.message + ': ' + event.where);
  }
});
```

##### Server (Apex)
```java
public with sharing class MyRemoteController {
    @RemoteAction
    public static List<SObject> query(String queryJSON) {
        Map<String, Object> qconfig = (Map<String, Object>) JSON.deserializeUntyped(queryJSON);
        Query query = new Query(qconfig);
        query.validate(); // HERE we check FLS and other access control
        return Database.query(query.toSOQL());
    }
}
```

You can see the query execution is done in Apex runtime just like RemoteTK, so Apex governor limit will also be applied (e.g. maximum number of querying records).
On the other hand, Remote Objects has its own different limit - for example maximum 100 records per request, and offset value doesn't have a limit (see Developer's Guide).


## Source Code

The Apex classes used in the above description is published in GitHub.

https://github.com/stomita/soql-secure

Additionally there is a runnable demo hosted on Force.com Site.

https://soql-remoting-demo-developer-edition.ap2.force.com/

From the aspect of building SOQL dynamically, there is a well-known library named [SOQL builder](http://apex-commons.github.io/query/soql-builder/) in [Apex Commons](http://apex-commons.github.io/), [soql-secure](https://github.com/stomita/soql-secure) is different because it generates a secure SOQL with FLS checking from JSON definition.

## Summary and Opinion

Because soql-secure library which I introduced here is still under PoC phase, it is too early to adopt in production.
Personally I am considering to add an extension in JSforce library to bypass the API request call when it can utilize soql-secure.

You should note that Remote Objects is a very new feature recently released, and it seems definitely evolving.
There is a possibility that Remote Objects feature will gain more flexibility in query description on par with SOQL via API.

However, assuming that it happens, there would remain a question why only API has a call limit with a same query capability.

In the forum or blogs in Salesforce community, many people are saying welcome to Remote Objects as a killer feature, but I'm not quite satisfied with it because of this reason.
If there were no API request call limitation, this feature would not have to be introduced.

In my opinion, the correct way for Salesforce to head is to remove current API request limit, or increase it substantially.
I know they are saying "API First". I hope it is not just a marketing slogan.
