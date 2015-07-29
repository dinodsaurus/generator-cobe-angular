/*global -$ */
"use strict";
// generated on <%= (new Date).toISOString().split("T")[0] %> using <%= pkg.name %> <%= pkg.version %>
var gulp = require("gulp");
var $ = require("gulp-load-plugins")();
var browserSync = require("browser-sync");
var reload = browserSync.reload;

gulp.task("styles",  () => {<% if (includeSass) { %>
  return gulp.src("app/styles/**/*.scss")
    .pipe($.plumber({
      handleError: (err) => {
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

gulp.task("scripts", () => {
  return gulp.src("app/js/**/*.js")
  .pipe($.plumber({
    handleError: (err) => {
        console.log(err);
        this.emit("end");
    }
  }))
  .pipe($.babel())
  .pipe($.size())
  .pipe(gulp.dest(".tmp/js"));
});

gulp.task("partials", () => {
  return gulp.src("app/js/**/*.html")
  .pipe($.angularTemplatecache("templates.js",{standalone:true}))
  .pipe(gulp.dest(".tmp/partials"));
});

gulp.task("constants", () => {
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

gulp.task("html", ["styles", "partials"], () => {
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

gulp.task("images", () => {
  return gulp.src("app/img/**/*")
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest("dist/img"));
});

gulp.task("fonts", () => {
  return gulp.src(require("main-bower-files")().concat("app/fonts/**/*"))
    .pipe($.filter("**/*.{eot,svg,ttf,woff,otf}"))
    .pipe(gulp.dest(".tmp/fonts"))
    .pipe(gulp.dest("dist/fonts"));
});

gulp.task("extras", () => {
  return gulp.src([
    "app/*.*",
    "!app/*.html"
  ], {
    dot: true
  }).pipe(gulp.dest("dist"));
});

gulp.task("clean", require("del").bind(null, [".tmp", "dist"]));

gulp.task("serve", <% if (includeSass) { %> ["styles", "constants", "partials", "scripts"],<% } %> () => {
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
    ".tmp/scripts/**/*.js",
    ".tmp/partials/**/*.js",
    "app/images/**/*"
  ]).on("change", reload);

  gulp.watch("app/styles/**/*.<%= includeSass ? "scss" : "css" %>", ["styles"]);
  gulp.watch("bower.json", ["wiredep", "fonts"]);
  gulp.watch("app/js/**/*.js", ["scripts"]);
  gulp.watch("app/js/**/*.html", ["partials"]);
});

// inject bower components
gulp.task("wiredep", () => {
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
      exclude: ["bootstrap-sass-official", "jquery"],<% } %>
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest("app"));
});

 gulp.task("build", ["validate", "constants", "html", "images", "fonts", "extras"], () => {
   return gulp.src("dist/**/*").pipe($.size({title: "build", gzip: true}));
 });

 gulp.task("default", ["clean"], () => {
   gulp.start("build");
 });
 gulp.task("lint", () => {
    return gulp.src("app/scripts/main.js")
        .pipe($.jshint())
        .pipe($.jshint.reporter("jshint-stylish"))
        .pipe($.jshint.reporter("fail"));
});

gulp.task("test", ["scripts", "constants", "partials"], () => {
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
    .on("error", (err) => {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    });
 });

gulp.task("e2e", () => {
  gulp.src(["./e2e/*.e2e.js"])
      .pipe($.protractor.protractor({
          configFile: "./e2e/e2e.conf.js",
          args: ["--baseUrl", "http://localhost:9000"]
      }))
      .on("error", (e) => { throw e; });
});

gulp.task("validate", ["lint", "test"]);
