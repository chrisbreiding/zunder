# Zunder

An opinionated front-end build tool for developing apps with ES2015 and SCSS.

Zunder provides gulp tasks to do the following:

* create boilerplate files to get you up and running quickly
* watch your files for changes and update them
* compile your ES2015 JavaScript and SCSS
* run a server to serve your assets
* build your assets for production with minification and cache-busting
* deploy your app to github pages

Zunder uses babel with ES2015 and React presets, so you can use all ES2015 features supported by babel as well as JSX.

## Installation & Setup

Install gulp globally.

```sh
$ npm install gulp -g
```

Install Zunder and gulp locally.

```sh
$ npm install zunder gulp --save-dev
```

Create a gulpfile at the root of your project. As far as Zunder is concerned, it only needs to contain the following.

```javascript
var gulp = require('gulp');
require('zunder')(gulp);
```

Run the setup task for Zunder. Read more about it under the Tasks section below.

```sh
$ gulp zunder
```

## Tasks

### watch

```sh
$ gulp watch
```

* watches and compiles JavaScript (ES2015 and JSX) and SCSS files
* if you place static assets in a root directory named `static`, they will be copied to the root of the app
* builds src/index.hbs
* serves the app on a port you've configured or one that's available (see Configuration below)

### build

```sh
$ gulp build
```

* compiles JavaScript (ES2015 and JSX) and SCSS files
* minifies the generated JS and CSS
* adds a cache-buster to the generated JS and CSS files based on their contents
* if you place static assets in a root directory named `static`, they will be copied to the root of the app
* builds src/index.hbs

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

Runs scaffolding to get you started. Adds boilerplate files, including some SCSS files, a basic React 'app', an example dev server API, and Font Awesome for your icon needs.

It will *not* override files that already exist. You can run it multiple times if necessary without worrying.

## License

The MIT License (MIT)

Copyright (c) 2014 Chris Breiding

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
