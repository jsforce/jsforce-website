---
layout: default
category: top
headline: top-headline
title: Getting Started
stylesheets:
  - /css/top.css
---

<ul class="nav nav-tabs">
  <li class="active"><a href="#node-js" data-toggle="tab">Node.js</a></li>
  <li><a href="#web-browser-oauth2" data-toggle="tab">Web Browser</a></li>
  <li><a href="#web-browser-vf" data-toggle="tab">Visualforce</a></li>
  <li><a href="#cli" data-toggle="tab">Command Line Interface (CLI)</a></li>
</ul>

<div class="tab-content">

<!-- Node.js -->
<div class="tab-pane active" id="node-js">
<h4>Setup</h4>

<pre><code>$ npm install jsforce
</code></pre>

<h4>Run</h4>

<pre><code class="lang-javascript">var jsforce = require('jsforce');
var conn = new jsforce.Connection();
conn.login('username@domain.com', 'password', function(err, res) {
  if (err) { return console.error(err); }
  conn.query('SELECT Id, Name FROM Account', function(err, res) {
    if (err) { return console.error(err); }
    console.log(res);
  });
});</code></pre>
</div>

<!--- Web Browser -->
<div class="tab-pane" id="web-browser-oauth2">

<h4>Run</h4>

<pre><code class="lang-html">&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;script src="/path/to/jsforce.js"&gt;&lt;/script&gt;
  &lt;script&gt;
jsforce.browser.init({
  clientId: '[ your Salesforce OAuth2 ClientID is here ]',
  redirectUri: '[ your Salesforce registered redirect URI is here ]'
});
jsforce.browser.on('connect', function(conn) {
  conn.query('SELECT Id, Name FROM Account', function(err, res) {
    if (err) { return console.error(err); }
    console.log(res);
  });
});
  &lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;button onclick="javascript:jsforce.browser.login();"&gt;Login&lt;/button&gt;
&lt;/body&gt;
&lt;/html&gt;
</code></pre>

</div>

<!-- Web Browser (Visualforce) -->
<div class="tab-pane" id="web-browser-vf">

<h4>Run</h4>

<pre><code class="lang-html">&lt;apex:page docType="html-5.0" showHeader="false"&gt;
  &lt;apex:includeScript value="{!URLFOR($Resources.JSforce)}" /&gt;
  &lt;script&gt;
var conn = new jsforce.Connection({ accessToken: '{!$API.Session_Id}' });
conn.query('SELECT Id, Name FROM Account', function(err, res) {
  if (err) { return console.error(err); }
  console.log(res);
});
  &lt;/script&gt;
&lt;/apex:page&gt;
</code></pre>

</div>

<!-- Command Line Interface (CLI) -->
<div class="tab-pane" id="cli">

<h4>Setup</h4>

<pre><code>$ npm install -g jsforce</code></pre>

<h4>Run</h4>

<pre><code>$ jsforce -c username@salesforce.example.org -e "query('SELECT Id, Name FROM Account LIMIT 5')"

{"totalSize":5,"done":true,"records":[{"attributes":{"type":"Account","url":"/services/data/v29.0/sobjects/Account/001i0000009PyDrAAK"},"Id":"001i0000009PyDrAAK","Name":"GenePoint"},{"attributes":{"type":"Account","url":"/services/data/v29.0/sobjects/Account/001i0000009PyDsAAK"},"Id":"001i0000009PyDsAAK","Name":"United Oil & Gas, UK"},{"attributes":{"type":"Account","url":"/services/data/v29.0/sobjects/Account/001i0000009PyDtAAK"},"Id":"001i0000009PyDtAAK","Name":"United Oil & Gas, Singapore"},{"attributes":{"type":"Account","url":"/services/data/v29.0/sobjects/Account/001i0000009PyDuAAK"},"Id":"001i0000009PyDuAAK","Name":"Edge Communications"},{"attributes":{"type":"Account","url":"/services/data/v29.0/sobjects/Account/001i0000009PyDvAAK"},"Id":"001i0000009PyDvAAK","Name":"Burlington Textiles Corp of America"}]}
</code></pre>
</div>

</div><!-- end of tab-content-->
