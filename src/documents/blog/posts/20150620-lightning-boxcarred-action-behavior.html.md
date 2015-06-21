---
layout: default
headline: blog/headline
contentTemplate: blog/post
category: blog
title: Lightning's "Boxcarred Action" and Its Behavior
date: 2015-06-20
author:
  name: Shinichi Tomita
  url: https://github.com/stomita
---

If you are developing an app on Lightning framework of Salesforce, you may know that the framework has `$A.enqueueAction()` method call to invoke server-side Apex.

As the name suggests, it does not send the request to the server immediately -
it queues the request instead and bundle all requests queued during certain time period.

This mechanism is called "[Boxcarred Action](http://pchittum.com/2015/04/20/Lightning-Component-Action-Service/)" - the salesforce.com evangelist Peter Chittum's blog.

They say the benefit of "Boxcarring" is especially in mobile environment which has bandwidth limitation -
which can reduce the overhead of multiple HTTP requests and can avoid the browsers' simultaneous request limit.

By the way, the idea of bundling multiple HTTP requests to improve performance is not such a new one.
The most famous case is Netflix's API architecture redesign.

- [Redesigning the Netflix API](http://techblog.netflix.com/2011/02/redesigning-netflix-api.html)
- [Embracing the Differences : Inside the Netflix API Redesign](http://techblog.netflix.com/2012/07/embracing-differences-inside-netflix.html)

Of cource Netflix's case is a little different from Lightning and cannot be simply compared because Netflix provides device-specific endpoints while Lightning foresees much versatile approach as a framework.

At any hand the mechanism is named as one of the most brilliant part of Lightning framework.
By forcing managed server connection by the framework, and not allowing direct connection from each components,
every components would get benefit of optimized performance.
Congratulations !


## Effectiveness of Boxcarred Action

OK, then I would like to measure how much the mechanism will benefit to us. Let's try.

I created a lightning component bundle listed below. This component sends 5 simultaneous requests to server-side when the button is clicked.

Each request parameter has different sleeping time - for getting response from server after the specified time. The sleeping time of each requests are 1 sec, 2 secs, 3 secs, 4 secs, and 5 secs.

```javascript:BoxcarPerfTestController.js
({
    startPerformanceTest : function(cmp, event, helper) {
        var returnedCount = 0;
        var parallelCount = 5;
        var startTime = Date.now();
        for (var i=1; i<=parallelCount; i++) {
            (function(i) {
                var action = cmp.get("c.requestWithSleep");
                action.setParams({
                    requestId: ""+i,
                    sleepInMsec: 1000*i
                });
                action.setCallback(cmp, function(res) {
                    console.log('callbacked: ' + i);
                    var endTime = Date.now();
                    var elapsedTime = endTime - startTime;
                    console.log('Elapsed (req='+i+'): '+elapsedTime);
                    returnedCount++;
                    if (returnedCount === parallelCount) {
                        console.log('Total elapsed : '+elapsedTime);
                        cmp.set("v.elapsed", elapsedTime);
                    }
                });
                $A.enqueueAction(action);
                console.log('requested: ' + i);
            })(i);
        }
        cmp.set("v.elapsed", 0);
    }
})
```

```xml:BoxcarPerfTestComponent.cmp
<aura:component
    controller="BoxcarPerfTestController"
    implements="flexipage:availableForAllPageTypes"
>
    <aura:attribute name="elapsed" type="integer" />
    <ui:button press="{!c.startPerformanceTest}" label="Start Performance Test" />
    <aura:renderIf isTrue="{! v.elapsed > 0 }">
        <div>Total elappsed time: <span>{!v.elapsed}</span> msec</div>
    </aura:renderIf>
</aura:component>
```

The server-side code (Apex) is listed below.

There is no feature in Apex to wait or sleep in given period, so we substitute by HTTP callout to Heroku-hosted webapp.
I don't list the Heroku part here, but I suppose you can easily imagine the app which waits milliseconds specified by the parameter before returning response.

```java:BoxcarPerfTestController.cls
public class BoxcarPerfTestController {
    @RemoteAction
    @AuraEnabled
    public static Boolean requestWithSleep(String requestId, Integer sleepInMsec) {
        String echoServiceUrl = 'https://sleeping-test.herokuapp.com/echo';
        echoServiceUrl += '?requestId=' + requestId + '&sleepInMsec='+sleepInMsec;
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(echoServiceUrl);
        req.setMethod('GET');
        HttpResponse res = h.send(req);
        return res.getStatusCode() == 200;
    }
}
```

The executed result is coming next (the output of console.log message).

```text
requested: 1
requested: 2
requested: 3
requested: 4
requested: 5
callbacked: 1
Elapsed (req=1): 16847
callbacked: 2
Elapsed (req=2): 16848
callbacked: 3
Elapsed (req=3): 16848
callbacked: 4
Elapsed (req=4): 16849
callbacked: 5
Elapsed (req=5): 16849
Total elapsed : 16849
```

It took almost 17 secs elapsed for all requests even though each requests were supposed to take only 1-5 secs.
What has been happened here ?

We can understand the part that each of the request ceased in the same timing -
they are sharing one HTTP request so all the callbacks would be callbacked when the actual HTTP response has arrived.
However, even if that case, we usually expect the timing will be around 5 secs - the maximum elapse time of the requests.
What a terrible result we didn't expect.

After the confusion about the result, we may encounter a hypothetical explanation for the symptom - that is, the requests are processed sequentially.
If so, the result of 17 secs is understandable because the sum of 1, 2, 3, 4, 5 is 15.

If the hypothesis is true, it is obvious even for the beginner of Lightning that calling by each is better than bundling - even if it is optimized for mobile environment. Or you may conclude you cannot utilize this in production environment.


## Buffering in Visualforce JavaScript Remoting

For comaprison, the "Boxcarred Action" feature is not only for the Lightning framework - the Visualforce's JavaScript remoting has almost same feature option, `buffer`.
I wonder whether this feature is also processed in sequential or not.

So I've created the Visualforce page below to measure the performance.

```html:BoxcarPerfTestPage.page
<apex:page showHeader="false" docType="html-5.0"
           applyBodyTag="false"
           applyHtmlTag="false"
           controller="BoxcarPerfTestController"
>
<html>
<head>
    <script>
    function startPerformanceTest(buffered) {
        var returnedCount = 0;
        var parallelCount = 5;
        var startTime = Date.now();
        for (var i=1; i<=parallelCount; i++) {
            (function(i) {
                BoxcarPerfTestController.requestWithSleep(""+i, 1000*i, function(result, event) {
                    var endTime = Date.now();
                    var elapsedTime = endTime - startTime;
                    console.log('Elapsed (req='+i+'): '+elapsedTime);
                    returnedCount++;
                    if (returnedCount === parallelCount) {
                        console.log('Total elapsed: ', elapsedTime);
                    }
                }, { buffer: buffered });
                console.log('requested: ' + i);
            })(i);
        }
	}
    </script>
</head>
<body>
    <button onClick="startPerformanceTest(true)">Start Performance Test(Buffered)</button>
    <button onClick="startPerformanceTest(false)">Start Performance Test(Not Buffered)</button>
</body>
</html>
</apex:page>
```

In the above code it can pass true/false value for the buffer option of Remoting call.
Let's see the result when the buffer is enabled. Console message output is here.


```text
requested: 1
requested: 2
requested: 3
requested: 4
requested: 5
callbacked: 1
Elapsed (req=1): 17844
callbacked: 2
Elapsed (req=2): 17845
callbacked: 3
Elapsed (req=3): 17845
callbacked: 4
Elapsed (req=4): 17845
callbacked: 5
Elapsed (req=5): 17845
Total elapsed: 17845
```

It seems almost the same result as Lightning. Next, buffer=false.

```text
requested: 1
requested: 2
requested: 3
requested: 4
requested: 5
callbacked: 1
Elapsed (req=1): 1895
callbacked: 2
Elapsed (req=2): 2919
callbacked: 3
Elapsed (req=3): 4045
callbacked: 4
Elapsed (req=4): 4967
callbacked: 5
Elapsed (req=5): 5993
Total elapsed: 5993
```

Each request receives the response in almost the same timing of each request's elapse time.
Total elapsed time is almost 6 secs, so the result is overwhelming compared to the buffer-enabled.

Now we can see that, it is not such a brilliant thing as the framework provider announces - either buffer in remoting or boxcarring in Lightning.
Additionally, the buffer in remoting is enabled by default, so you have to set it to false anytime when you want to go parallel.

But in remoting we can set buffering off by option. How about Lightning ?

Peter Chittum says in his [blog](http://pchittum.com/2015/04/28/Lightning-Component-Exclusive-Actions/) they have `setExclusive()` method in action instance passed in `enqueueAction()`, which is designed to use HTTP request exclusively for that action call.

However, in the timing of writing this article, it seems not working - it will be boxcarred in any setting.


## Consideration

In the first place, which case the Boxcarred Action will become effective, aside the problem above ?

Now I pick up a use case of mobile devices where Boxcarred Action is said to be effective.

In Lightning framework, Lightning components consists of a Lightning page.
The Boxcarred Action is only valid when the server-side requests are simultaneously requested, so the main battlefield will be the page load timing.
However, many mobile devices like smartphone has quite limitation in display size, so not so much components can be shown at once.
The number of components will be 2 or 3 at most, I assume.
I really wonder if the bundling of 2 or 3 requests are really important for the environment.
So it seems that boxcarring will not receive so much benefits in mobile environment, contrary to the announcement of Salesforce.

Then consider the situation where many components are displayed at once - for example dashboard or portal screen.
This is mainly accessed by PC (or maybe tablets), which will be the area covered by the desktop version of Lightning.
In PC, the network environment tends to be rather better than the mobile devices - so boxcarring is not required so eagerly.

* * *

I think the boxcarring is not a bad idea, but it should be accompanied with parallel processing in server-side. As currently not, it is useless.
If the boxcarring continues to be processed sequentially, it is easily predicted that the more the user put components into the page the worse initial rendering speed become - which won't benefit to the user.

## Summary

- $A.enqueueAction will not be processed in parallel but sequentially in server-side.
- In Visualforce JS Remoting, the bundling can be avoided by setting buffer option to false; which makes much better performance.
- Don't rely on the official announcement without having the inspection.
