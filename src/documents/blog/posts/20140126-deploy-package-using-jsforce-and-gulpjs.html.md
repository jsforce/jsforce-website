---
layout: default
headline: blog/headline
contentTemplate: blog/post
category: blog
title: Deploying Package to Salesforce Using JSforce and Gulp.js
date: 2015-01-26
author:
  name: Shinichi Tomita
  url: https://github.com/stomita
---

[Gulp.js](http://gulpjs.com) is a simple task/build runner to process front-end stuff, which utilizes pipes for streaming data that needs to be processed.

As gulp.js is running on Node.js, various Node.js-based packages - including JSforce - can be used in build scripts.

In this article, we'll show how to deploy a force.com package using gulp, which can contain Force.com metadata objects like custom object/field definitions, Apex classes, Visualforce pages, or CSS/JavaScript/image files as static resource archive.

(All files including build script and source codes of this article is available from [here](https://github.com/jsforce/example-gulp-jsforce))

## Example

First, we assume a project with following directory structure :

```
├── gulpfile.coffee
├── package.json
├── pkg
│   ├── package.xml
│   ├── pages
│   │   ├── MyAppPage.page
│   │   └── MyAppPage.page-meta.xml
│   └── staticresources
│       ├── MyApp.resource
│       └── MyApp.resource-meta.xml
└── src
    ├── images
    │   └── salesforce.jpg
    ├── scripts
    │   └── main.coffee
    └── styles
        └── main.less
```

In this project it has the `pkg/` directory - a package of Force.com metadata objects for example Apex classes or Visualforce pages.
The `src/` directory includes all static files to be built and archived to a zipped static resource file by gulp.

The `gulpfile.coffee` is the script which describes building and deploying tasks in CoffeeScript (you can use normal JavaScript if you like, of course).

## Building Static Files

Like other general frontend development, you can build JavaScript or CSS files in gulp tasks. In this example we compile CoffeeScript source code to JavaScript, bundle it with all dependencies using browserify, and uglify it to minify the content. For CSS, we compile from LESS stylesheets. Other static files like HTML or images are just copied to temporary build directory.

When all static files are built, they will be zipped as a static resource file in `pkg/staticresources` directory.


```coffee
gulp = require "gulp"
zip = require "gulp-zip"
less = require "gulp-less"
streamify = require "gulp-streamify"
uglify = require "gulp-uglify"
minify = require "gulp-minify-css"
browserify = require "browserify"
source = require "vinyl-source-stream"

# Building CSS files from LESS source
gulp.task "css", ->
  gulp.src "./src/styles/main.less"
    .pipe less()
    .pipe minify()
    .pipe gulp.dest "./build/css"

# Compile and bundle JS file from CoffeeScript source code
gulp.task "js", ->
  browserify
    entries: [ "./src/scripts/main.coffee" ]
    extensions: [ ".coffee" ]
  .bundle()
  .pipe source "main.js"
  .pipe streamify uglify()
  .pipe gulp.dest "./build/js"

# Copy all static files in src directory to temporary build directory
gulp.task "statics", ->
  gulp.src [ "./src/**/*.html", "./src/images/**/*" ], base: "./src"
    .pipe gulp.dest "./build"

# Zip all built files as a static resource file
gulp.task "zip", [ "css", "js", "statics" ], ->
  gulp.src "./build/**/*"
    .pipe zip("MyApp.resource")
    .pipe gulp.dest "./pkg/staticresources"

# Build
gulp.task "build", [ "zip" ]

```

## Deploying to Salesforce

As all frontend files are built, now the time to upload and deploy the Force.com package to Salesforce.
The deploy task first zips package directory, pipe it to `forceDeploy` stream which accepts zipped file contents and
pass it to JSforce `Metadata#deploy()` API call.

```coffee
through2 = require "through2"
jsforce = require "jsforce"

###
# Returns a stream pipe for deploying zipped package to Salesforce
###
forceDeploy = (username, password) ->
  through2.obj (file, enc, callback) ->
    conn = new jsforce.Connection()
    conn.login username, password
    .then ->
      conn.metadata.deploy(file.contents).complete(details: true)
    .then (res) ->
      if res.details?.componentFailures
        console.error res.details?.componentFailures
        return callback(new Error('Deploy failed.'))
      callback()
    , (err) ->
      console.error(err)
      callback(err)

###
# Deploying package to Salesforce
###
gulp.task "deploy", ->
  gulp.src "./pkg/**/*", base: "."
    .pipe zip("pkg.zip")
    .pipe forceDeploy(process.env.SF_USERNAME, process.env.SF_PASSWORD)


# Default entry point
gulp.task "default", [ "build", "deploy" ]
```

## Running Gulp

Now you can build and deploy all files to Salesforce by following command :

```
$ SF_USERNAME=xxxx@yourdomain.com SF_PASSWORD=yourpassword gulp
```

If you have installed [foreman](https://github.com/ddollar/foreman), you can prepare `.env` file in your project with above credentials and execute following :

```
$ foreman run gulp
```

Of course you can combine `gulp.watch` to watch file changes and automatically deploy to Salesforce when a change happens.

```
gulp.task "watch", ->
  gulp.watch "./src/**/*", [ "build" ]
  gulp.watch "./pkg/**/*", [ "deploy" ]
```

Use `gulp watch` to start watching file changes.

```
$ foreman run gulp watch
[20:57:46] Requiring external module coffee-script/register
[20:57:49] Using gulpfile /tmp/gulp-jsforce-example/gulpfile.coffee
[20:57:49] Starting 'watch'...
[20:57:49] Finished 'watch' after 44 ms

```
