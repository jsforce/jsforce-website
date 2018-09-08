# DocPad Configuration File
# http://docpad.org/docs/config

# Define the DocPad Configuration

docpadConfig = {

  templateData:
    version: '1.9.1'
    apiVersion: "42.0"
    site:
      url: "http://jsforce.github.io"
      title: "JSforce"
      description: "Salesforce API Library for JavaScript Applications"
      keywords: "salesforce,javascript,api,node.js"
      salesforce:
        if process.env.NODE_ENV == 'production'
          clientId: '3MVG9A2kN3Bn17hv5Z.MnUUfJRTgrq0KwgysLOXrljNJ1JB6HijwsXoNi8Imxvwi3b6pknYch_sU771SM1lTh'
          redirectUri: 'https://jsforce.github.io/callback.html'
          proxyUrl: 'https://node-salesforce-proxy.herokuapp.com/proxy/'
        else
          clientId: '3MVG9A2kN3Bn17hv5Z.MnUUfJRR0vtFfsvtVhkKTHPSz5gt5t6rMBSfyic.6YCd2J9YQEJ17kRk2cNEEKYLyD'
          redirectUri: 'http://localhost:9778/callback.html'
          proxyUrl: 'https://node-salesforce-proxy.herokuapp.com/proxy/'
    navigations: [
      name: "start"
      title: "Getting Started"
      url: "/start/"
    ,
      name: "document"
      title: "Document"
      url: "/document/"
    ,
      name: "download"
      title: "Download"
      url: "/download/"
    ,
      name: "blog"
      title: "Blog"
      url: "/blog/"
    ,
      name: "api"
      title: "API Reference"
      url: "http://jsforce.github.io/jsforce/doc/"
    ,
      name: "console"
      title: "Web Console"
      url: "/jsforce-web-console/"
    ,
      name: "github"
      title: "GitHub"
      icon: "github"
      url: "https://github.com/jsforce/jsforce"
    ]
    footerNavigations: [
      title: "Home"
      url: "/"
    ]

  	# helper functions

    moment: require("moment")

    extend: require("underscore").extend

  collections:
    posts: ->
      @getCollection('documents').findAllLive({ relativeOutDirPath: 'blog/posts' }, [ date: -1 ])

}

# Export the DocPad Configuration
module.exports = docpadConfig
