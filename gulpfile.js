const gulp = require("gulp");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const tsify = require("tsify");
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const typedoc = require("gulp-typedoc");

gulp.task("typedoc", function() {
  return gulp
      .src(["src/**/*.ts"])
      .pipe(typedoc({
          module: "commonjs",
          target: "es5",
          exclude: [
            '**/*.test.ts',
          ],
          out: "doc/",
          name: "Letter"
      }))
  ;
});

const browserifyOptions = {
  basedir: ".",
  debug: true,
  standalone:'letter',
  entries: ["src/index.ts"],
  cache: {},
  packageCache: {}
};

gulp.task('build', function compler() {
  return browserify(browserifyOptions)
    .plugin(tsify)
    .bundle()
    .pipe(source("letter.js"))
    .pipe(gulp.dest("dist"));
});

gulp.task('build-minify', function compler() {
  return browserify({...browserifyOptions,debug:true})
    .plugin(tsify)
    .bundle()
    .pipe(source('letter.min.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));
});

gulp.task(
  "default",
  gulp.series("build", "build-minify")
);
