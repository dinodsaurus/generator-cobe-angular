/*global -$ */
"use strict";
// generated on <%= (new Date).toISOString().split("T")[0] %> using <%= pkg.name %> <%= pkg.version %>
var gulp = require("gulp");
var $ = require("gulp-load-plugins")();
var browserSync = require("browser-sync");
var reload = browserSync.reload;

gulp.task("styles", function () {<% if (includeSass) { %>
  return gulp.src("app/styles/main.scss")
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
  //.pipe($.jshint())
  //.pipe($.jshint.reporter("jshint-stylish"))
  .pipe($.size());
});

gulp.task("partials", function () {
  return gulp.src("app/js/**/*.html")
  .pipe($.angularTemplatecache("templates.js",{standalone:true}))
  .pipe(gulp.dest(".tmp/partials"));
});

gulp.task("jshint", function () {
  return gulp.src("app/js/**/*.js")
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter("jshint-stylish"))
    .pipe($.if(!browserSync.active, $.jshint.reporter("fail")));
});

gulp.task("html", ["styles", "partials"], function () {
  var assets = $.useref.assets({searchPath: [".tmp", "app", "."]});
  var jsFilter = $.filter("**/*.js");
  var cssFilter = $.filter("**/*.css");

  return gulp.src("app/*.html")
    .pipe(assets)
    .pipe(jsFilter)
    .pipe($.ngmin())
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
  return gulp.src("app/images/**/*")
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest("dist/images"));
});

gulp.task("fonts", function () {
  return gulp.src(require("main-bower-files")().concat("app/fonts/**/*"))
    .pipe($.filter("**/*.{eot,svg,ttf,woff}"))
    .pipe($.flatten())
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

gulp.task("serve", <% if (includeSass) { %> ["styles", "partials", "scripts"],<% } %>function () {
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

gulp.task("test", ["scripts"], function () {
  var wiredep = require("wiredep");
  var bowerDeps = wiredep({
    directory: "bower_components",
    exclude: ["bootstrap-sass-official"],
    dependencies: true,
    devDependencies: true
  });

  var testFiles = bowerDeps.js.concat([
    "app/js/**/*.js",
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


 gulp.task("build", ["jshint", "html", "images", "fonts", "extras"], function () {
   return gulp.src("dist/**/*").pipe($.size({title: "build", gzip: true}));
 });

 gulp.task("default", ["clean"], function () {
   gulp.start("build");
 });

 gulp.task('lint', function () {
    return gulp.src('app/scripts/main.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jshint.reporter('fail'));
});

gulp.task('validate', ['lint', 'test']);
