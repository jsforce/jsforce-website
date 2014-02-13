# DocPad Configuration File
# http://docpad.org/docs/config

# Define the DocPad Configuration

docpadConfig = {

  templateData:
    site:
      url: "http://jsforce.github.io"
      title: "JSforce"
      description: "Salesforce API Library for JavaScript Applications"
      keywords: "salesforce,javascript,api,node.js"
      copyright: "Copyright &copy; #{new Date().getFullYear()} Shinichi Tomita, All Rights Reserved"
    navigations: [
      name: "top"
      icon: "home"
      url: "/"
    ,
      name: "document"
      title: "Document"
      url: "/highlight/"
    ,
      name: "api"
      title: "Document"
      url: "/highlight/"
    ]
    footerNavigations: [
      title: "Home"
      url: "/"
    ]
	# ...

}

# Export the DocPad Configuration
module.exports = docpadConfig
