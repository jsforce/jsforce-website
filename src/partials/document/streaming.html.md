---
---

## Streaming API

You can subscribe topic and receive message from Salesforce Streaming API,
by using `Streaming#Topic(topicName)` and `Streaming-Topic#subscribe(listener)`.

Before the subscription, you should insert appropriate PushTopic record 
(in this example, "InvoiceStatementUpdates") as written in [Streaming API guide](http://www.salesforce.com/us/developer/docs/api_streaming/).

```javascript
conn.streaming.topic("InvoiceStatementUpdates").subscribe(function(message) {
  console.log('Event Type : ' + message.event.type);
  console.log('Event Created : ' + message.event.createdDate);
  console.log('Object Id : ' + message.sobject.Id);
});
```



