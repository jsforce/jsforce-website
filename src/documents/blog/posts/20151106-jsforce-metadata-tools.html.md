---
layout: default
headline: blog/headline
contentTemplate: blog/post
category: blog
title: JSforce Metadata Tools
date: 2015-11-06
author:
  name: Shinichi Tomita
  url: https://github.com/stomita
---

JSforce has several features including Salesforce Metadata API access.
So by using JSforce we can create not only a JavaScript application but also a deployment task of Salesforce package.

I previously wrote [how JSforce can be used in Salesforce package deployment on Gulp.js](./20140126-deploy-package-using-jsforce-and-gulpjs.html), and there are NPM packages called [gulp-jsforce-deploy](https://www.npmjs.com/package/gulp-jsforce-deploy) or [grunt-jsforce-deploy](https://www.npmjs.com/package/gulp-jsforce-deploy).

In this article I'd like to introduce a tool named [JSforce metadata tools](https://www.npmjs.com/package/jsforce-metadata-tools).


## JSforce Metadata Tools

The JSforce metadata tools is at once a command-line tool and JavaScript library.
You can run metadata deployment/retrieval by using commands in your local shell.
For example, if you have a package directory and want to deploy it to Salesforce, you can type simply following command:

```bash
$ jsforce-deploy -u admin@example.org -p password123 -D ./path/to/packageDir
```

JSforce metadata tools is also provided as a library, so it is very easy to embed the deploying/retrieval feature in any custom scripts.

The former plugins of Gulp.js and Grunt.js (i.e. gulp-jsforce-deploy and grunt-jsforce-deploy) are both including JSforce metadata tools library and delegating the deployment process to it.

### Setup

To start using JSforce Metadata Tools as a command-line tool, you can install it globally via npm.

```
$ npm install -g jsforce-metadata-tools
```

After the installation, two commands named `jsforce-deploy` and `jsforce-retrieve` will be available in your path. The former is for deploying package, and the latter is retrieving package files from Salesforce.

### Deploy Command

There are several options available in `jsforce-deploy` command. If you put `--help` option the list of available options are shown.

```
$ jsforce-deploy --help

  Usage: jsforce-deploy [options]

  Options:

    -h, --help                     output usage information
    -u, --username [username]      Salesforce username
    -p, --password [password]      Salesforce password (and security token, if available)
    -c, --connection [connection]  Connection name stored in connection registry
    -l, --loginUrl [loginUrl]      Salesforce login url
    --sandbox                      Login to Salesforce sandbox
    -D, --directory [directory]    Local directory path of the package to deploy
    -Z, --zipFile [zipFile]        Input file path of ZIP archive of metadata files to deploy
    --pid [pid]                    Process ID of previous deployment to check status
    --dry-run                      Dry run. Same as --checkOnly
    --checkOnly                    Whether Apex classes and triggers are saved to the organization as part of the deployment
    --testLevel [testLevel]        Specifies which tests are run as part of a deployment (NoTestRun/RunSpecifiedTests/RunLocalTests/RunAllTestsInOrg)
    --runTests [runTests]          A list of Apex tests to run during deployment (commma separated)
    --ignoreWarnings               Indicates whether a warning should allow a deployment to complete successfully (true) or not (false).
    --rollbackOnError              Indicates whether any failure causes a complete rollback (true) or not (false)
    --pollTimeout [pollTimeout]    Polling timeout in millisec (default is 60000ms)
    --pollInterval [pollInterval]  Polling interval in millisec (default is 5000ms)
    --verbose                      Output execution detail log
    -V, --version                  output the version number
```

To connect to Salesforce instance where you want to deploy the package, use `-u` and `-p` options (`--username` and `--password`).

```
$ jsforce-deploy -u username@example.org -p password123 -D ./package
```

When your account is in a login endpoint other than the default (https://login.salesforce.com), you can specify it by `-l` (`--loginUrl`) option. If it is sandbox (https://test.salesforce.com) you can use `--sandbox` instead of the full URL.

```
$ jsforce-deploy -u username@example.org -p password123 -l https://mydomain.my.salesforce.com -D ./package
```

As the tools can lookup JSforce connection registry, you can use the already established connection in JSforce REPL. You can specify it in `-c` (`--connection`) option. If the connection is still valid you don't have to input any password.

```
$ jsforce-deploy -c username@example.org -D ./package
```

The `-D` (`--directory`) option is for specifying the directory path where deploying package files are located. The directory must be in standard Salesforce package directory structure - at least it should contain `package.xml` file in its root.

```
$ tree ./package -L 1 -F
./package
├── classes/
├── objects/
├── package.xml
├── staticresources/
└── triggers/
$ jsforce-deploy -c username@example.org -D ./package
```

If you have already ZIP-ed archive file of Salesforce package, you can specify it in `-Z` (`---zipFile`) option.

```
$ jsforce-deploy -c username@example.org -Z ./package.zip
```

After the deployment request are sent to the server, the tool watches its deployment job process completion by polling deployment status. The polling interval or polling timeout length can be customized by passing `--pollInterval` or `--pollTimeout` options.

If the deployment process has been timed out, it will output the deployment process ID in the console. After a few minutes you can check the deployment status by re-executing `jsforce-deploy` command with the process ID in `--pid` option.

```
$ jsforce-deploy -c username@example.org -D ./pacakge
Logged in as: username@example.org
Deploying to server...
Polling time out. Process Id = 0Af28000009s9RYCAY
$ jsforce-deploy -c username@example.org --pid 0Af28000009s9RYCAY
Logged in as: username@example.org

Deploy Succeeded.

Id: 0Af28000009s9RYCAY
Status: Succeeded
Success: true
Done: true
Number Component Errors; 0
Number Components Deployed: 188
Number Components Total: 188
Number Test Errors; 0
Number Tests Completed: 0
Number Tests Total: 0
```

Other options, like `--testLevel`, `--checkOnly` or `--rollbackOnError` are the specific options of Salesforce Metadata API. For the detail, please check the official Metadata API reference.


### Retrieve Command

The `jsforce-retrieve` command does fetch metadata file information stored in Salesforce organization and (optionally) extract them to the local file system.

```
$ jsforce-retrieve --help

  Usage: jsforce-retrieve [options]

  Options:

    -h, --help                     output usage information
    -u, --username [username]      Salesforce username
    -p, --password [password]      Salesforce password (and security token, if available)
    -c, --connection [connection]  Connection name stored in connection registry
    -l, --loginUrl [loginUrl]      Salesforce login url
    --sandbox                      Login to Salesforce sandbox
    -D, --directory [directory]    Directory path to extract the retrieved metadata files. Should be a list (comma-separated) if there are multiple entries in packageNames
    -Z, --zipFile [zipFile]        Output file path of ZIP archive of retrieved metadata
    -P, --packageXML [packageXML]  A package.xml file path to specify the retrieving metadata contents
    --pid [pid]                    Process ID of previous retrieve request
    --apiVersion [apiVersion]      API version of retrieving package
    --packageNames [packageNames]  List of package names to retrieve (comma separated)
    --memberTypes [memberTypes]    Metadata types and its members. The format is like following: "ApexClass:Class1,Class2;ApexPage:Page1,Page2;ApexTrigger:*"
    --pollTimeout [pollTimeout]    Polling timeout in millisec (default is 60000ms)
    --pollInterval [pollInterval]  Polling interval in millisec (default is 5000ms)
    --verbose                      Output execution detail log
    -V, --version                  output the version number
```

If you already have fetched metadata files in local file system, you can specify the directory path in `-D` (`--directory`) option.
Note that it should contain the package.xml in its directory root as same as the `jsforce-deploy` command.

```
$ tree -L 1 -F
./package
└── package.xml

$ jsforce-retrieve -c username@example.org -D ./pacakge
Logged in as: username@example.org
Retrieving from server...

Retrieve Succeeded.

Id: 09S28000001cnRfEAI
Status: Succeeded
Success: true
Done: true

Extracting:  package/pages/Page1.page
Extracting:  package/pages/Page1.page-meta.xml
Extracting:  package/pages/Page2.page
Extracting:  package/pages/Page2.page-meta.xml
Extracting:  package/classes/Class1.cls
Extracting:  package/classes/Class1.cls-meta.xml
Extracting:  package/classes/Class2.cls
Extracting:  package/classes/Class2.cls-meta.xml
Extracting:  package/package.xml

$ tree -L 1 -F
./package
├── classes/
│   ├── Class1.cls
│   ├── Class1.cls-meta.xml
│   ├── Class2.cls
│   └── Class2.cls-meta.xml
├── package.xml
└── pages/
    ├── Page1.page
    ├── Page1.page-meta.xml
    ├── Page2.page
    └── Page2.page-meta.xml
```

If there are already fetched metadata files, it will overwrite them by fetched metadata files. If you don't want to overwrite the files but extract them to other directory, you should specify the source package.xml in `-P` (`--packageXML`) option and destination directory in `-D` (`--directory`) option.

```
$ jsforce-retrieve -c username@example.org -P ./package/package.xml -D ./retrieved_package
```

When you don't want to extract the retrieved metadata files and keep them as a archived file (zip), you can specify the output zip file path in `-Z` (`--zipFile`) option instead of specifying `--directory` option.

```
$ jsforce-retrieve -c username@example.org -P ./package/package.xml -Z ./retrieved_package.zip
```

If you want to access all metadata files registered in Salesforce packages, you can specify their names in `--packageNames` options.

```
$ jsforce-retrieve -c username@example.org --packageNames "MyPackage1,MyPackage2" -D ./retrieved_packages
```

If you want to specify metadata components to retrieve by yourself, the `--memberTypes` option is the way to do it.

```
$ jsforce-retrieve -c username@example.org --memberTypes "ApexClass:Class1,Class2;ApexPage:*"
```
