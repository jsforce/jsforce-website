---
---

## Streaming API

You can subscribe topic and receive message from Salesforce Streaming API, by using `Streaming-Topic#subscribe(listener)`.

Before the subscription, you should insert appropriate PushTopic record (in this example, "InvoiceStatementUpdates") as written in Streaming API guide.

```javascript
conn.streaming.topic("InvoiceStatementUpdates").subscribe(function(message) {
  console.log('Event Type : ' + message.event.type);
  console.log('Event Created : ' + message.event.createdDate);
  console.log('Object Id : ' + message.sobject.Id);
});
```

NOTE: Before version 0.6, there are `Connection#topic(topicName)` to access streaming topic object, and `Connection#subscribe(topicName, listener)` is used to subscribe altenatively. These methods are now obsolete and use `Streaming#topic(topicName)` and `Streaming#subscribe(topicName, listener)` through `streaming` API object in connection object instead.


