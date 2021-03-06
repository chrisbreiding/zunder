# <img src='./src/lib/icon.png' width='32' height='32' /> Zunder

An opinionated front-end build tool for developing apps with React and SCSS.

Zunder provides tasks to do the following:

* install react and eslint dependencies
* create boilerplate files to get you up and running quickly
* watch your files for changes and update them
* compile your JavaScript and SCSS
* run a server to serve your assets
* build your assets for production with minification and cache-busting
* create an [app cache manifest](https://developer.mozilla.org/en-US/docs/Web/HTML/Using_the_application_cache)
* run unit tests via mocha, with watch mode that auto-runs tests when associated app file changes
* deploy your app to github pages

Zunder uses babel with [env](https://www.npmjs.com/package/babel-preset-env), [stage-1](https://www.npmjs.com/package/babel-preset-stage-1), and [react](https://www.npmjs.com/package/babel-preset-react) presets, so you can use the latest ES features as well as JSX.

## Installation & Setup

Install Zunder.

```sh
$ npm install zunder --save-dev
```

Run the setup task. Read more about it under the Tasks section below.

```sh
$ $(npm bin)/zunder setup
```

## Tasks

### watch

```sh
$ $(npm bin)/zunder watch
```

Use while developing your app.

* watches and compiles JavaScript (including JSX) and SCSS files
* copies assets from the `static` directory
* builds src/index.hbs
* serves the app on an available port

### build-dev / build-prod

```sh
$ $(npm bin)/zunder build-dev
or
$ $(npm bin)/zunder build-prod
```

Build your app for the given environment.

Both do:

* compiles JavaScript (including JSX) and SCSS files
* copies assets from the `static` directory
* builds src/index.hbs

Only `build-prod` does:

* minifies the generated JS and CSS
* adds a cache-buster to the generated JS and CSS files based on their contents

### serve-dev / serve-prod

```sh
$ $(npm bin)/zunder serve-dev
or
$ $(npm bin)/zunder serve-prod
```

Serves the app on an available port. `serve-dev` serves the `devDir` and `serve-prod` serves the `prodDir`. See [zunder config](#zunder-config).

### test

Runs all mocha tests.

By convention, tests should live next to their source files, suffixed with `.spec`. So if the source file is `app.js`, its spec is `app.spec.js`.

### deploy

```sh
$ $(npm bin)/zunder deploy
```

Builds your app (same as the build task, without running a server), creates a branch called gh-pages, and pushes the branch to the origin remote. _Note_: the branch will be force pushed, so any history for the gh-pages branch on the remote will be wiped out.

### clean

```sh
$ $(npm bin)/zunder clean
```

Remove all built directories and files.

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

The zunder instance (returned from `require('zunder')`) has a config object with the following properties (default values shown):

```javascript
{
  appCache: false, // create app cache manifest?
  appCacheTransform: null, // function that receives list of files to include in manifest. return filtered/augmented list
  browserifyOptions: {/* ... see below ... */},
  watchifyOptions: {/* ... see below ... */},
  cacheBust: true, // cache bust assets? only affects prod task. is always false for dev/test tasks
  cacheFilter: () => true, // receives file name, return true to cache bust, false not to cache bust
  deployBranch: 'gh-pages', // branch to deploy to
  devDir: 'dist', // output directory for dev tasks (e.g. build-dev, watch)
  externalBundles: [], // array of objects with shape { scriptName, libs } for outputting separate bundles. useful for separating vendor scripts from app script
  prodDir: 'dist-prod', // output directory for prod tasks (e.g. build-prod, deploy)
  sassOptions: {/* ... see below ... */},
  scripts: {
    'src/main.+(js|jsx)': 'app.js', // object of source file to output name
  },
  stylesheets: { // stylus is also supported, but must be configured
    'src/main.scss': {
      watch: ['src/**/*.scss'],
      output: 'app.css',
    },
  },
  staticGlobs: ['static/**'], // globs of static files to copy into output directory
  testDir: 'dist-test', // output directory for test task
  testSetup: 'lib/test-setup.js', // location of mocha test setup file
}
```

You can update the config in your `zunderfile.js` like so:

```javascript
const zunder = require('zunder')

zunder.setConfig({
  prodDir: 'build', // overrides the 'prodDir' setting
})
```

#### Default browserifyOptions

```javascript
{
  extensions: ['.js', '.jsx'],
  plugin: [],
  transform: [
    ['babelify', {/* ... see below ... */}],
    'envify',
  ]
}
```

##### Default babelify options

```javascript
{
  plugins: [
    'plugin-add-module-exports',
    '@babel/plugin-proposal-object-rest-spread',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
  ],
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
  ],
}
```

#### Default watchifyOptions

```javascript
{
  ignoreWatch: [
    '**/package.json',
    '**/.git/**',
    '**/.nyc_output/**',
    '**/.sass-cache/**',
    '**/coverage/**',
    '**/node_modules/**',
  ],
}
```

#### sassOptions

The default sass options are:

```javascript
{
  // used by all tasks
  default: {
    importer: globber,
  },
  // used by dev tasks along with the default options
  dev: {
    sourceComments: true,
    outputStyle: 'expanded',
  },
  // used by prod tasks along with the default options
  prod: {
    outputStyle: 'compressed',
  },
}
```

The options are merged together into one object that's passed to `node-sass` based on environment. So for `dev` tasks, the default options are:

```javascript
{
  importer: globber,
  sourceComments: true,
  outputStyle: 'expanded',
}
```

And for `prod` tasks, the default options are:

```javascript
{
  importer: globber,
  outputStyle: 'compressed',
}
```

If there is an option in `dev` or `prod` that's also in `default`, the `dev` or `prod` option will override the `default` option.

### Adding CoffeeScript support

CoffeeScript support can be configured in the *zunderfile*.

```javascript
const zunder = require('zunder')

const { browserifyOptions } = zunder.config
browserifyOptions.extensions.push('.coffee')
browserifyOptions.transform.push([
  zunder.defaults.browserify.transformCoffeeify.module,
  // only necessary if you need to use a specific version of
  // coffeescript. otherwise, the version of coffee-script
  // shipped with zunder (via @cypress/coffeeify) will be used
  {
    coffeeCompiler: require('coffee-script'),
  },
])

zunder.setConfig({
  browserifyOptions,
  // only necessary if you want to use main.coffee as your entry file
  // otherwise, leave this out
  scripts: {
    'src/main.coffee': 'app.js',
  }
})
```

### Adding Sass includePaths

Add `node_modules` as in includePath for Sass, so you can `@import` styles in `node_modules` without using the full path:

```javascript
const zunder = require('zunder')

zunder.setConfig({
  sassOptions: {
    default: {
      includePaths: ['node_modules'],
    },
  },
})
```

## Notifications

By default, when in `watch` mode, notifications will be sent through your system or Growl when there is an error. To disable notifications, use the env variable `DISABLE_NOTIFIER`:

```
export DISABLE_NOTIFIER=true;
```

## License

The MIT License (MIT)

Copyright (c) 2017 Chris Breiding

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
