# Cobe angular generator

[Yeoman](http://yeoman.io) generator that scaffolds out a [Angular](https://angularjs.org/) application using [gulp](http://gulpjs.com/) for the build process. This generator is build on top of the [gulp-webapp](https://github.com/yeoman/generator-gulp-webapp) generator.

Build by people from [COBE](http://cobeisfresh.com/) with <3

![](screenshoot.png)


## Features

Please see [gulpfile.js](app/templates/gulpfile.js) for up to date information on what we support.

* CSS Autoprefixing
* Pre commit hook that validates your code
* Built-in preview server with BrowserSync
* Automagically compile Sass with [libsass](http://libsass.org)
* Automagically minify your scripts
* Automagically generate angular templates
* Automagically wire-up dependencies installed with [Bower](http://bower.io)
* Awesome image optimization
* Easy unit testing with Karma and Jasmine
* Easy e2e testing with Protractor

*For more information on what this generator can do for you, take a look at the [gulp plugins](app/templates/_package.json) used in our `package.json`.*


## libsass

Keep in mind that libsass is feature-wise not fully compatible with Ruby Sass. Check out [this](http://sass-compatibility.github.io) curated list of incompatibilities to find out which features are missing.

If your favorite feature is missing and you really need Ruby Sass, you can always switch to [gulp-ruby-sass](https://github.com/sindresorhus/gulp-ruby-sass) and update the `styles` task in `gulpfile.js` accordingly.

## Project Structure

    ├── app
    │   ├── fonts
    │   ├── img
    │   ├── js                  - All the javascript is located here
    │   ├── styles              - All the scss files are here
    │   ├── config.json         - Environment variables are place here
    │   ├── favico.ico
    │   └── index.html          - index files with all the comments which are used by gulp
    ├── e2e                     - Our protractor end to end tests
    │   ├── e2e.conf.json       - Configurtion file for protractor
    │   └── test.e2e.js         - Initial protractor test
    └── .gitignore              - ignores npm and bower files
    └── .jshintrc               - initial jshint settings
    └── gulpfile.js             - all the gulp tasks are defined here
    └── bower.json              - all the frontend dependencies
    └── package.json            - all node dependencies
    └── karma.conf.js           - karma config file


An example of `app/js` folder structure

    app
    ├── main
    │   ├── controllers
    │   │   ├── MainController.js
    │   │   └── MainController.spec.js
    │   ├── directives
    │   │   └── TechDirective.js
    │   ├── services
    │   └── views
    │       └── home.html
    └── app.js

## Getting Started

- Install dependencies: `npm install --global yo bower`
- Install the generator: `npm install --global generator-cobe-angular`
- Run `yo cobe-angular` to scaffold your Angular app
- Run `gulp serve` to preview and watch for changes
- Run `gulp validate` to run your unit tests and lint your code
- Run `gulp constants` to make angular constants out of your `app/config.json`
- Run `webdriver-manager start` to run your webdriver server
- Run `gulp e2e` to run your end to end tests
- Run `bower install --save <package>` to install frontend dependencies
- Run `gulp` to build your webapp for production

##### To run e2e tests you need to have gulp  and webdriver server running.

##### You need to manually install `npm install precommit-hook` after git is initialized.



## License

[MIT license](http://opensource.org/licenses/MIT)
