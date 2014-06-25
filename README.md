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

## Installation & Use

Install Zunder and other necessary dependencies:

```
npm install zunder gulp handlebars@1.1.2 jquery --save-dev
```

In your gulpfile:

```
require('zunder')();
```

Zunder tries to be agnostic about how you organize your files, but some structure and boilerplate files are necessary. Create the following:

```
app
|- vendor
|  |- ember.js
|- app.coffee
|- app.styl
|- index.hbs
|- router.coffee
```

To get browserify to work with Ember, add the following to your package.json:

```
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

```
gulp dev
```

* watches CoffeeScript and Stylus files
* if you place static assets in a root directory named `static`, they will be copied to the root of the app
* builds app/index.hbs
* serves the app on a port you've configured or one that's available (see Configuration below)

If you haven't configured a prefix for your tasks (see Configuration below), this becomes the default task, so you can just run `gulp`.

```
gulp prod
```

* compiles CoffeeScript and Stylus files
* minifies the generated JS and CSS
* adds a cache-buster to the generated JS and CSS files based on their contents
* if you place static assets in a root directory named `static`, they will be copied to the root of the app
* builds app/index.hbs
* serves the app on a port you've configured or one that's available (see Configuration below)

```
gulp build
```

Same as `gulp prod`, but it doesn't run a server

```
gulp deploy
```

Runs `gulp build`, creates a branch called gh-pages, and pushes the branch to the origin remote. Note: the branch will be force pushed, so any history for the gh-pages branch on the remote will be wiped out.

```
gulp clean
```

Remove the development and production directories.

## Configuration

Zunder can be configured like so in your gulpfile:

```
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
