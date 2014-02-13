docpad = require "docpad"
docpad.createInstance {}, (err, instance) ->
  return console.error(err) if err
  instance.action "generate server watch", (err, result) ->
    return console.error(err) if err
    console.log('OK')
