/*global -$ */
"use strict";
// generated on <%= (new Date).toISOString().split("T")[0] %> using <%= pkg.name %> <%= pkg.version %>
var gulp = require("gulp");
var $ = require("gulp-load-plugins")();
var browserSync = require("browser-sync");
var reload = browserSync.reload;

gulp.task("styles", function () {<% if (includeSass) { %>
  return gulp.src("app/styles/**/*.scss")
    .pipe($.plumber({
      handleError: function (err) {
          console.log(err);
          this.emit("end");
      }
    }))
    .pipe($.sass({
      outputStyle: "nested", // libsass doesn"t support expanded yet
      precision: 10,
      includePaths: ["."],
      onError: console.error.bind(console, "Sass error:")
    }))<% } else { %>
  return gulp.src("app/styles/main.css")<% } %>
    .pipe($.postcss([
      require("autoprefixer-core")({browsers: ["last 1 version"]})
    ]))
    .pipe(gulp.dest(".tmp/styles"));
});

gulp.task("scripts", function () {
  return gulp.src("app/js/**/*.js")
  .pipe($.plumber({
    handleError: function (err) {
        console.log(err);
        this.emit("end");
    }
  }))
  .pipe($.babel())
  .pipe($.size())
  .pipe(gulp.dest(".tmp/js"));
});

gulp.task("partials", function () {
  return gulp.src("app/js/**/*.html")
  .pipe($.angularTemplatecache("templates.js",{standalone:true}))
  .pipe(gulp.dest(".tmp/partials"));
});

gulp.task("constants", function () {
  var myConfig = require("./app/config.json");
  //export NODE_ENV=development
  var env = process.env.NODE_ENV || "development";
  var envConfig = myConfig[env];
  return $.ngConstant({
      name: "constants",
      constants: envConfig,
      stream: true
    })
    .pipe(gulp.dest(".tmp"));
});

gulp.task("html", ["styles", "partials"], function () {
  var assets = $.useref.assets({searchPath: [".tmp", "."]});
  var jsFilter = $.filter("**/*.js");
  var cssFilter = $.filter("**/*.css");

  return gulp.src("app/*.html")
    .pipe(assets)
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    .pipe($.uglify())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.csso())
    .pipe(cssFilter.restore())
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if("*.html", $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest("dist"));
});

gulp.task("images", function () {
  return gulp.src("app/img/**/*")
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest("dist/img"));
});

gulp.task("fonts", function () {
  return gulp.src(require("main-bower-files")().concat("app/fonts/**/*"))
    .pipe($.filter("**/*.{eot,svg,ttf,woff,otf}"))
    .pipe(gulp.dest(".tmp/fonts"))
    .pipe(gulp.dest("dist/fonts"));
});

gulp.task("extras", function () {
  return gulp.src([
    "app/*.*",
    "!app/*.html"
  ], {
    dot: true
  }).pipe(gulp.dest("dist"));
});

gulp.task("clean", require("del").bind(null, [".tmp", "dist"]));

gulp.task("serve", <% if (includeSass) { %> ["styles", "constants", "partials", "scripts"],<% } %>function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: [".tmp", "app"],
      routes: {
        "/bower_components": "bower_components"
      }
    }
  });

  // watch for changes
  gulp.watch([
    "app/*.html",
    ".tmp/styles/**/*.css",
    "app/scripts/**/*.js",
    "app/images/**/*"
  ]).on("change", reload);

  gulp.watch("app/styles/**/*.<%= includeSass ? "scss" : "css" %>", ["styles", reload]);
  gulp.watch("bower.json", ["wiredep", "fonts", reload]);
  gulp.watch("app/js/**/*.js", ["scripts", reload]);
  gulp.watch("app/js/**/*.html", ["partials", reload]);
});

// inject bower components
gulp.task("wiredep", function () {
  var wiredep = require("wiredep").stream;
<% if (includeSass) { %>
  gulp.src("app/styles/*.scss")
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest("app/styles"));
<% } %>
  gulp.src("app/*.html")
    .pipe(wiredep({<% if (includeSass && includeBootstrap) { %>
      exclude: ["bootstrap-sass-official"],<% } %>
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest("app"));
});

 gulp.task("build", ["validate", "constants", "html", "images", "fonts", "extras"], function () {
   return gulp.src("dist/**/*").pipe($.size({title: "build", gzip: true}));
 });

 gulp.task("default", ["clean"], function () {
   gulp.start("build");
 });
 gulp.task("lint", function () {
    return gulp.src("app/scripts/main.js")
        .pipe($.jshint())
        .pipe($.jshint.reporter("jshint-stylish"))
        .pipe($.jshint.reporter("fail"));
});

gulp.task("test", ["scripts", "constants", "partials"], function () {
  var wiredep = require("wiredep");
  var bowerDeps = wiredep({
    directory: "bower_components",
    exclude: ["bootstrap-sass-official"],
    dependencies: true,
    devDependencies: true
  });

  var testFiles = bowerDeps.js.concat([
    ".tmp/**/*.js"
    ]);

    gulp.src(testFiles)
    .pipe($.karma({
      configFile: "karma.conf.js",
      action:  "run"
    }))
    .on("error", function (err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    });
 });

gulp.task("e2e", function () {
  gulp.src(["./e2e/*.e2e.js"])
      .pipe($.protractor.protractor({
          configFile: "./e2e/e2e.conf.js",
          args: ["--baseUrl", "http://localhost:9000"]
      }))
      .on("error", function(e) { throw e; });
});

gulp.task("validate", ["lint", "test"]);
