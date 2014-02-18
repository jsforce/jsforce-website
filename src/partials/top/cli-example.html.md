---
---

### Setup

```shell
$ npm install -g jsforce
```

### Example

```shell

$ jsforce
> .connect username@salesforce.example.org
Password: *******
Logged in as : username@salesforce.example.org
> query("SELECT Id, Name FROM Account LIMIT 1")
{ totalSize: 1,
  done: true,
  records: 
   [ { attributes: [Object],
       Id: '0015000000KBQ5GAAX',
       Name: 'GenePoint' } ] }
> .exit

$ jsforce -c username@salesforce.example.org -e "query('SELECT Id, Name FROM Account LIMIT 2')"
{"totalSize":2,"done":true,"records":[{"attributes":{"type":"Account","url":"/services/data/v29.0/sobjects/Account/001i0000009PyDrAAK"},"Id":"001i0000009PyDrAAK","Name":"GenePoint"},{"attributes":{"type":"Account","url":"/services/data/v29.0/sobjects/Account/001i0000009PyDsAAK"},"Id":"001i0000009PyDsAAK","Name":"United Oil & Gas, UK"}]}
```
