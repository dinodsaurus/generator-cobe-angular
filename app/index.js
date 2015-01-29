'use strict';
var fs = require('fs');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var wiredep = require('wiredep');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.option('test-framework', {
      desc: 'Test framework to be invoked',
      type: String,
      defaults: 'mocha'
    });

    this.option('skip-welcome-message', {
      desc: 'Skips the welcome message',
      type: Boolean
    });

    this.option('skip-install', {
      desc: 'Skips the installation of dependencies',
      type: Boolean
    });

    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });
  },

  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();

    if (!this.options['skip-welcome-message']) {
      this.log(yosay('\'Allo \'allo! Out of the box I include HTML5 Boilerplate, jQuery, and a gulpfile.js to build your app.'));
    }

    var prompts = [{
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [{
        name: 'Sass',
        value: 'includeSass',
        checked: true
      }, {
        name: 'Bootstrap',
        value: 'includeBootstrap',
        checked: true
      }, {
        name: 'Modernizr',
        value: 'includeModernizr',
        checked: true
      }]
    }];

    this.prompt(prompts, function (answers) {
      var features = answers.features;

      var hasFeature = function (feat) {
        return features.indexOf(feat) !== -1;
      };

      // manually deal with the response, get back and store the results.
      // we change a bit this way of doing to automatically do this in the self.prompt() method.
      this.includeSass = hasFeature('includeSass');
      this.includeBootstrap = hasFeature('includeBootstrap');
      this.includeModernizr = hasFeature('includeModernizr');

      done();
    }.bind(this));
  },

  writing: {
    gulpfile: function() {
      this.template('gulpfile.js');
    },

    packageJSON: function() {
      this.template('_package.json', 'package.json');
    },

    git: function() {
      this.copy('gitignore', '.gitignore');
      this.copy('gitattributes', '.gitattributes');
    },

    bower: function() {
      var bower = {
        name: this._.slugify(this.appname),
        private: true,
        dependencies: {}
      };

      if (this.includeModernizr) {
        bower.dependencies.modernizr = '~2.8.1';
      }

      bower.dependencies.angular = "~1.3.4";
      bower.dependencies["angular-ui-router"] = "~0.2.13";
      this.copy('bowerrc', '.bowerrc');
      this.write('bower.json', JSON.stringify(bower, null, 2));
    },

    jshint: function () {
      this.copy('jshintrc', '.jshintrc');
    },

    editorConfig: function () {
      this.copy('editorconfig', '.editorconfig');
    },

    h5bp: function () {
      this.copy('favicon.ico', 'app/favicon.ico');
      this.copy('robots.txt', 'app/robots.txt');
    },

    mainStylesheet: function () {
      var css = 'main';

      if (this.includeSass) {
        css += '.scss';
      } else {
        css += '.css';
      }

      this.copy(css, 'app/styles/' + css);
    },

    writeIndex: function () {
      this.indexFile = this.src.read('index.html');
      this.indexFile = this.engine(this.indexFile, this);

      this.mainScript = this.src.read('app.js');
      this.mainScript = this.engine(this.mainScript, this);

      this.homeScript = this.src.read('main.controller.js');
      this.homeScript = this.engine(this.homeScript, this);

      this.homeSpec = this.src.read('main.controller.spec.js');
      this.homeSpec = this.engine(this.homeSpec, this);

      this.cityDir = this.src.read('city.directive.js');
      this.cityDir = this.engine(this.cityDir, this);
    },

    app: function () {
      this.mkdir('app');
      this.mkdir('app/js');
      this.mkdir('app/js/main');
      this.mkdir('app/js/main/controllers');
      this.mkdir('app/js/main/resources');
      this.mkdir('app/js/main/resources');
      this.mkdir('app/js/main/services');
      this.mkdir('app/js/main/directives');
      this.mkdir('app/js/main/views');
      this.mkdir('app/vendor/');
      this.mkdir('app/styles');
      this.mkdir('app/img');
      this.mkdir('app/fonts');
      this.mkdir('app/svg');
      this.copy('index.html','app/index.html');
      this.copy('app.js', 'app/js/app.js');
      this.copy('main.controller.js', 'app/js/main/controllers/MainController.js');
      this.copy('main.controller.spec.js', 'app/js/main/controllers/MainController.spec.js');
      this.copy('city.directive.js', 'app/js/main/directives/CityDirective.js');

  },

  install: function () {
    var howToInstall =
      '\nAfter running ' +
      chalk.yellow.bold('npm install & bower install') +
      ', inject your' +
      '\nfront end dependencies by running ' +
      chalk.yellow.bold('gulp wiredep') +
      '.';

    if (this.options['skip-install']) {
      this.log(howToInstall);
      return;
    }

    this.installDependencies({
      skipMessage: this.options['skip-install-message'],
      skipInstall: this.options['skip-install']
    });

    this.on('end', function () {
      var bowerJson = this.dest.readJSON('bower.json');

      // wire Bower packages to .html
      wiredep({
        bowerJson: bowerJson,
        directory: 'bower_components',
        exclude: ['bootstrap-sass', 'bootstrap.js'],
        ignorePath: /^(\.\.\/)*\.\./,
        src: 'app/index.html'
      });

      if (this.includeSass) {
        // wire Bower packages to .scss
        wiredep({
          bowerJson: bowerJson,
          directory: 'bower_components',
          ignorePath: /^(\.\.\/)+/,
          src: 'app/styles/*.scss'
        });
      }

      // ideally we should use composeWith, but we're invoking it here
      // because generator-mocha is changing the working directory
      // https://github.com/yeoman/generator-mocha/issues/28
      this.invoke(this.options['test-framework'], {
        options: {
          'skip-message': this.options['skip-install-message'],
          'skip-install': this.options['skip-install']
        }
      });
    }.bind(this));
  }
}
});
