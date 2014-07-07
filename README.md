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

## Installation & Setup

Install gulp globally. It's necessary for running the tasks.

```sh
$ npm install gulp -g
```

Install Zunder and gulp locally.

```sh
$ npm install zunder gulp --save-dev
```

Install jQuery and Handlebars, which are dependencies of Ember.

```sh
$ npm install jquery handlebars@1.1.2 --save
```

Create a gulpfile at the root of your project. As far as Zunder is concerned, it only needs to contain the following.

```javascript
require('zunder')()
```

Run the setup task for Zunder. Read more about it under the Tasks section below.

```sh
$ gulp zunder
```

## Tasks

### dev

```sh
$ gulp dev
```

* watches CoffeeScript and Stylus files
* if you place static assets in a root directory named `static`, they will be copied to the root of the app
* builds app/index.hbs
* serves the app on a port you've configured or one that's available (see Configuration below)

If you haven't configured a prefix for your tasks (see Configuration below), this becomes the default task, so you can just run `gulp`.

### prod

```sh
$ gulp prod
```

* compiles CoffeeScript and Stylus files
* minifies the generated JS and CSS
* adds a cache-buster to the generated JS and CSS files based on their contents
* if you place static assets in a root directory named `static`, they will be copied to the root of the app
* builds app/index.hbs
* serves the app on a port you've configured or one that's available (see Configuration below)

### build

```sh
$ gulp build
```

Same as `gulp prod`, but it doesn't run a server

### deploy

```sh
$ gulp deploy
```

Runs `gulp build`, creates a branch called gh-pages, and pushes the branch to the origin remote. Note: the branch will be force pushed, so any history for the gh-pages branch on the remote will be wiped out.

### clean

```sh
$ gulp clean
```

Remove the development and production directories.

### zunder

```sh
$ gulp zunder
```

Runs scaffolding necessary for Zunder to run.

Creates the following directories and files needed for Zunder to operate. `ember.js` will be the latest release of Ember.

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

Adds entries to your package.json that allow Ember to work with Browserify.

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

*Note*: this task will **not** override directories or files or any entries in your package.json that already exist.

## Configuration

Zunder can be configured like so in your gulpfile:

```javascript
require('zunder')({
  prefix: 'z-',
  devDir: 'development',
  prodDir: 'production',
  devPort: 8080,
  prodPort: 8081
});
```

The following configuration options are available:

**prefix**

*default*: '' (none)

If you have gulp tasks that Zunder will collide with, specify a prefix for all Zunder tasks. If your prefix is 'z-', the `gulp dev` task will become `gulp z-dev`. The default task will no longer be `gulp dev`.

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

## Contributing

Pull requests are welcome!

```sh
$ git clone https://github.com/chrisbreiding/zunder.git
$ cd zunder
$ npm install
```

### Running tests

One-off:

```sh
$ npm test
```

Continuous testing while developing:

```sh
$ testem
```

## License

The MIT License (MIT)

Copyright (c) 2014 Chris Breiding

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
