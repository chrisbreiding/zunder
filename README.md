# Zunder

A front-end build tool that makes developing apps with Ember, CoffeeScript, Browserify, and Stylus a breeze.

Zunder provides gulp tasks to do the following:

* watch your files for changes and update them
* compile your CoffeeScript and Stylus
* run your scripts through browserify
* compile your Handlebars templates to work with Ember
* run a server to serve your assets
* build your assets for production with minification and cache-busting
* deploy your app to github pages

Zunder tries to be agnostic about the way you organize your app. This is made possible by Browserify and by the flexibility of Stylus globbing. The only required directory/file structure is fairly minimal and is described under the Manual Setup section below.

## Installation & Use

Install Zunder and other necessary dependencies:

```sh
$ npm install gulp -g
$ npm install zunder gulp handlebars@1.1.2 jquery --save-dev
```

In your gulpfile:

```javascript
require('zunder')();
```

## Setup

Zunder requires some setup to work. Luckily, this can be automatically by Zunder itself. Or, if you'd prefer, follow the instructions below for accomplishing it manually.

### Automatic

Run the `gulp zunder` task to set up the bits Zunder needs to work. Read more about what it does under the Tasks section below.

### Manual

Create the following directories and files at the root of your application:

```
.
|- app
|  |- vendor
|  |  |- ember.js
|  |- app.coffee
|  |- app.styl
|  |- index.hbs
|  |- router.coffee
```

Add the following to your package.json:

```javascript
"browser": {
  "ember": "./app/vendor/ember.js"
},
"browserify-shim": {
  "ember": {
    "exports": "Ember",
    "depends": [
      "jquery:jQuery",
      "handlebars:Handlebars"
    ]
  }
}
```

## Tasks

```sh
$ gulp dev
```

* watches CoffeeScript and Stylus files
* if you place static assets in a root directory named `static`, they will be copied to the root of the app
* builds app/index.hbs
* serves the app on a port you've configured or one that's available (see Configuration below)

If you haven't configured a prefix for your tasks (see Configuration below), this becomes the default task, so you can just run `gulp`.

```sh
$ gulp prod
```

* compiles CoffeeScript and Stylus files
* minifies the generated JS and CSS
* adds a cache-buster to the generated JS and CSS files based on their contents
* if you place static assets in a root directory named `static`, they will be copied to the root of the app
* builds app/index.hbs
* serves the app on a port you've configured or one that's available (see Configuration below)

```sh
$ gulp build
```

Same as `gulp prod`, but it doesn't run a server

```sh
$ gulp deploy
```

Runs `gulp build`, creates a branch called gh-pages, and pushes the branch to the origin remote. Note: the branch will be force pushed, so any history for the gh-pages branch on the remote will be wiped out.

```sh
$ gulp clean
```

Remove the development and production directories.

```sh
$ gulp zunder
```

Creates the directories and files needs for Zunder to operate and adds entries to your package.json that allow Ember to work with Browserify. The details of the setup are listed under the Manual Setup section above. Note: this task will **not** override directories or files or any entries in your package.json that already exist.

## Configuration

Zunder can be configured like so in your gulpfile:

```javascript
require('zunder')({
  prefix: 'myapp-',
  devDir: 'development',
  prodDir: 'production',
  devPort: 8080,
  prodPort: 8081
});
```

The following configuration options are available:

**prefix**

*default*: '' (none)

If you have gulp tasks that Zunder will collide with, specify a prefix for all Zunder tasks. If your prefix is 'myapp-', the `gulp dev` task will become `gulp myapp-dev`. The default tasks will no longer be `gulp dev`.

**devDir**

*default*: '_dev'

The directory name for the development version of the app. The dev server serves the assets in this directory. It is recommended you add this directory to your .gitignore.

**prodDir**

*default*: '_prod'

The directory name for the production version of the app. The `gulp prod` task serves the assets in this directory. The `gulp deploy` task deploys the assets in this directory. It is recommended you add this directory to your .gitignore.

**devPort**

*default*: an available port in the 8000 range

The port on which the development version of the app is served when you run `gulp dev`. By default, an available port in the 8000 range will be used.

**prodPort**

*default*: an available port in the 8000 range

The port on which the production version of the app is served when you run `gulp prod`. By default, an available port in the 8000 range will be used.
