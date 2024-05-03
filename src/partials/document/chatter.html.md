---
---

## Chatter API

Chatter API resources can be accessed via `Chatter#resource(path)`.
The path for the resource can be a relative path from `/services/data/vX.X/chatter/`, `/services/data/`, or site-root relative path,
otherwise absolute URI.

Please check official [Chatter REST API Guide](http://www.salesforce.com/us/developer/docs/chatterapi/) to understand resource paths for chatter objects.

### Get Resource Information

If you want to retrieve the information for specified resource, `Chatter-Resource#retrieve()` will get information of the resource.

```javascript
/* @interactive */
const res = await conn.chatter.resource('/users/me')
console.log(`username: ${res.username}`);
console.log(`email: ${res.email}`);
console.log(`small photo url: ${res.photo.smallPhotoUrl}`);
```

### Get Collection Resource Information

You can pass query parameters to collection resource, to filter result or specify offset/limit for result.
All acceptable query parameters are written in Chatter REST API manual.

```javascript
/* @interactive */
const result = await conn.chatter.resource('/users', { q: 'Suzuki' }).retrieve();

console.log("current page URL: " + result.currentPageUrl);
console.log("next page URL: " + result.nextPageUrl);
console.log("users count: " + result.users.length);

for (let i=0; i<result.users.length; i++) {
  const user = users[i];
  console.log('User ID: '+ user.id);
  console.log('User URL: '+ user.url);
  console.log('Username: '+ user.username);
}
```

### Post a Feed Item

To post a feed item or a comment, use `Chatter-Resource#create(data)` for collection resource.

```javascript
/* @interactive */
const result = await conn.chatter.resource('/feed-elements').create({
  body: {
    messageSegments: [{
      type: 'Text',
      text: 'This is new post'
    }]
  },
  feedElementType : 'FeedItem',
  subjectId: 'me'
})
console.log(`Id: ${result.id}`);
console.log(`URL: ${result.url}`);
console.log(`Body: ${result.body.messageSegments[0].text}`);
console.log(`Comments URL: ${result.capabilities.comments.page.currentPageUrl}`);
```

### Post a Comment

You can add a comment by posting message to feed item's comments URL:

```javascript
/* @interactive */
const commentsUrl = '/feed-elements/0D55000001j5qn8CAA/capabilities/comments/items';
const result = await conn.chatter.resource(commentsUrl).create({
  body: {
    messageSegments: [{
      type: 'Text',
      text: 'This is new comment #1'
    }]
  }
});
console.log(`Id: ${result.id}`);
console.log(`URL: ${result.url}`);
console.log(`Body: ${result.body.messageSegments[0].text}`);
```

### Add Like

You can add likes to feed items/comments by posting empty string to like URL:

```javascript
/* @interactive */
const itemLikesUrl = '/feed-elements/0D55000001j5r2rCAA/capabilities/chatter-likes/items';
const result = await conn.chatter.resource(itemLikesUrl).create("");

console.log(`URL: ${result.url}`);
console.log(`Liked Item ID:${result.likedItem.id}`);
```

### Batch Operation

Using `Chatter#batch(requests)`, you can execute multiple Chatter resource requests in one API call.
Requests should be CRUD operations for Chatter API resource.

```javascript
/* @interactive */

const res = await conn.chatter.batch([
  conn.chatter.resource('/feed-elements').create({
    body: {
      messageSegments: [{
        type: 'Text',
        text: 'This is a post text'
      }]
    },
    feedElementType: 'FeedItem',
    subjectId: 'me'
  }),
  conn.chatter.resource('/feed-elements').create({
    body: {
      messageSegments: [{
        type: 'Text',
        text: 'This is another post text, following to previous.'
      }]
    },
    feedElementType: 'FeedItem',
    subjectId: 'me'
  }),
  conn.chatter.resource('/feeds/news/me/feed-elements', { pageSize: 2, sort: "CreatedDateDesc" }),
])
console.log(`Error? ${res.hasErrors}`);
const results = res.results;
console.log(`batch request executed: ${results.length}`);
console.log(`request #1 - status code: ${results[0].statusCode}`);
console.log(`request #1 - result URL: ${results[0].result.url}`);
console.log(`request #2 - status code: ${results[1].statusCode}`);
console.log(`request #2 - result URL: ${results[1].result.url}`);
console.log(`request #3 - status code: ${results[2].statusCode}`);
console.log(`request #3 - current Page URL: ${results[2].result.currentPageUrl}`);

```



