# Zunder

An opinionated front-end build tool for developing apps with React, ES2015, and SCSS.

Zunder provides gulp tasks to do the following:

* install react and eslint dependencies
* create boilerplate files to get you up and running quickly
* watch your files for changes and update them
* compile your ES2015 JavaScript, CoffeeScript and SCSS
* run a server to serve your assets
* build your assets for production with minification and cache-busting
* deploy your app to github pages

Zunder uses babel with ES2015 and React presets, so you can use all ES2015 features supported by babel as well as JSX.

## Installation & Setup

Install Zunder.

```sh
$ npm install zunder --save-dev
```

Run the setup task. Read more about it under the Tasks section below.

```sh
$ ./node_modules/.bin/zunder setup
```

## Tasks

Note: To avoid having to type `./node_modules/.bin/` before commands, add the following to your shell profile (e.g. .bash_profile, .bashrc, .zshrc):

```sh
export PATH=./node_modules/.bin/:$PATH
```

Then you can run `zunder watch` instead of `./node_modules/.bin/zunder watch`.

### watch

```sh
$ ./node_modules/.bin/zunder watch
```

Use while developing your app.

* watches and compiles JavaScript (ES2015 and JSX), CoffeeScript and SCSS files
* copies assets from the `static` directory
* builds src/index.hbs
* serves the app on an available port

### build

```sh
$ ./node_modules/.bin/zunder build
```

Use to test out the production version of your app before deploying.

* compiles JavaScript (ES2015 and JSX), CoffeeScript and SCSS files
* minifies the generated JS and CSS
* adds a cache-buster to the generated JS and CSS files based on their contents
* copies assets from the `static` directory
* builds src/index.hbs
* serves the app on an available port

### deploy

```sh
$ ./node_modules/.bin/zunder deploy
```

Builds your app (same as the build task, without running a server), creates a branch called gh-pages, and pushes the branch to the origin remote. _Note_: the branch will be force pushed, so any history for the gh-pages branch on the remote will be wiped out.

### clean

```sh
$ ./node_modules/.bin/zunder clean
```

Remove all built directories and files.

### setup

```sh
$ ./node_modules/.bin/zunder setup
```

Installs dependencies and runs scaffolding to get you started. Adds boilerplate files, including an .eslintrc, some SCSS files, a basic React 'app', an example dev server API, and Font Awesome for your icon needs.

It will *not* override files that already exist. You can run it multiple times if necessary without worrying.

## zunderfile / Task hooks

You can run your own tasks during certain lifecycle events of zunder tasks by create a `zunderfile.js` at the root of your project:

```javascript
// zunderfile.js
var zunder = require('zunder');
var exec = require('child_proceess').exec;
var vfs = require('vinyl-fs');

// reset database before starting development
zunder.on('before:watch', function () {
  exec('rake db:reset', { cwd: process.cwd() + '/../my-rails-app' });
});

// copy all font-awesome fonts from bower into the
// prod directory after building for production
zunder.on('after:build-prod', function () {
  vfs.src('bower_components/font-awesome/fonts/**')           
    .pipe(vfs.dest(zunder.config.prodDir));
});
```

### hooks

The following hooks are available:

* before:clean
* after:clean
* before:watch
* before:build-prod
* after:build-prod
* before:serve-prod
* before:deploy
* after:deploy

### zunder config

The zunder instance (returned from `require('zunder')`) has a config object with the following properties:

* `devDir`: the build directory for the `watch` task
* `prodDir`: the build directory for the `build-prod`, `serve-prod`, and `deploy` tasks

## License

The MIT License (MIT)

Copyright (c) 2016 Chris Breiding

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
